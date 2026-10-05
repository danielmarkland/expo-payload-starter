import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildConfig, getPayload, type Payload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchPlugin } from '@payloadcms/plugin-search'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  exportSite,
  previewSiteReplacement,
  replaceSite,
  publishingTransferResources,
  decodeSiteArchive,
  siteTransferGatePlugin,
  payloadSiteWriteLock,
  payloadReplacementReceipt,
  type SiteTransferOptions,
} from '@danielmarkland/publishing-core/siteTransfer'
import {
  createAuthorsFields,
  createCategoriesFields,
  createTagsFields,
  createPostsFields,
} from '@danielmarkland/publishing-core/payloadEditorial'

const url = process.env.SITE_TRANSFER_TEST_DATABASE_URL
if (
  url &&
  (!['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ||
    new URL(url).pathname !== '/publishing_site_transfer_tests')
)
  throw new Error('Only the disposable local publishing_site_transfer_tests database is allowed')
let payload: Payload
let folder: string
let backup: Buffer
let options: SiteTransferOptions
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
  'base64',
)
const richText = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [
          { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' },
        ],
        direction: null,
        format: '' as const,
        indent: 0,
      },
    ],
    direction: null,
    format: '' as const,
    indent: 0,
  },
})

describe.skipIf(!url)('real Payload replacement transaction', () => {
  beforeAll(async () => {
    folder = await mkdtemp(join(tmpdir(), 'publishing-transfer-media-'))
    const config = await buildConfig({
      secret: 'disposable-site-transfer-secret',
      sharp,
      editor: lexicalEditor(),
      db: postgresAdapter({ pool: { connectionString: url }, push: true }),
      collections: [
        { slug: 'users', auth: true, fields: [] },
        {
          slug: 'media',
          upload: { staticDir: folder },
          fields: [{ name: 'alt', type: 'text', required: true }],
        },
        { slug: 'authors', fields: createAuthorsFields() },
        { slug: 'categories', fields: createCategoriesFields() },
        { slug: 'tags', fields: createTagsFields() },
        { slug: 'posts', versions: { drafts: true }, fields: createPostsFields() },
        {
          slug: 'pages',
          versions: { drafts: true },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'slug', type: 'text', unique: true, required: true },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                { slug: 'image', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
              ],
            },
          ],
        },
      ],
      plugins: [
        siteTransferGatePlugin({
          collections: ['media', 'authors', 'categories', 'tags', 'posts', 'pages', 'search'],
          scopes: async () => ['site'],
        }),
        searchPlugin({ collections: ['pages', 'posts'] }),
      ],
    })
    payload = await getPayload({ config })
    // The named disposable database can survive an earlier run or interruption.
    // Clear fixture rows before recreating originals in this run's temporary directory.
    for (const collection of [
      'pages',
      'posts',
      'authors',
      'categories',
      'tags',
      'search',
      'media',
    ] as const)
      await payload.delete({ collection, where: {} })
    const req = {}
    options = {
      payload,
      req,
      resources: publishingTransferResources(payload, false),
      readMedia: async (doc) => readFile(join(folder, String(doc.filename))),
      withWriteLock: payloadSiteWriteLock(payload, 'site', req),
      saveBackup: async (bytes) => {
        backup = bytes
        return 'verified-test-backup'
      },
    }
  }, 60000)
  afterAll(async () => {
    await payload?.destroy()
    if (folder) await rm(folder, { recursive: true, force: true })
  })
  it('replaces a populated site, retains published and draft versions, maps media and repeats', async () => {
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Pixel' },
      file: { data: png, mimetype: 'image/png', name: 'pixel.png', size: png.length },
    })
    const author = await payload.create({
      collection: 'authors',
      data: { name: 'Writer', slug: 'writer', image: media.id },
    })
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Published',
        slug: 'article',
        summary: 'Summary',
        body: richText('Published body'),
        author: author.id,
        _status: 'published',
      },
    })
    await payload.update({
      collection: 'posts',
      id: post.id,
      draft: true,
      data: { title: 'Draft', body: richText('Draft body') },
    })
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        layout: [{ blockType: 'image', image: media.id }],
        _status: 'published',
      },
    })
    const archive = await exportSite(options)
    await payload.create({ collection: 'tags', data: { title: 'Remove', slug: 'remove' } })
    let preview = await previewSiteReplacement(archive, options)
    expect(preview.removed.tags).toBe(1)
    await replaceSite(archive, preview, options)
    expect((await payload.find({ collection: 'tags' })).totalDocs).toBe(0)
    const published = (await payload.find({ collection: 'posts', draft: false, depth: 2 })).docs[0]!
    const draft = (await payload.find({ collection: 'posts', draft: true, depth: 2 })).docs[0]!
    expect(published.title).toBe('Published')
    expect(draft.title).toBe('Draft')
    expect((draft.author as { image: { alt: string } }).image.alt).toBe('Pixel')
    const importedMedia = (await payload.find({ collection: 'media' })).docs[0]!
    expect(await readFile(join(folder, String(importedMedia.filename)))).toEqual(png)
    expect((await payload.find({ collection: 'search' })).totalDocs).toBeGreaterThan(0)
    preview = await previewSiteReplacement(archive, options)
    await replaceSite(archive, preview, options)
    expect((await payload.find({ collection: 'posts' })).totalDocs).toBe(1)
    expect((await payload.find({ collection: 'media' })).totalDocs).toBe(1)
    expect(decodeSiteArchive(backup).manifest.records.length).toBeGreaterThan(0)
  }, 60000)
  it('blocks stale previews and restores a backup', async () => {
    const archive = await exportSite(options)
    const preview = await previewSiteReplacement(archive, options)
    const tag = await payload.create({
      collection: 'tags',
      data: { title: 'New production edit', slug: 'new' },
    })
    await expect(replaceSite(archive, preview, options)).rejects.toThrow('Destination changed')
    expect((await payload.findByID({ collection: 'tags', id: tag.id })).title).toBe(
      'New production edit',
    )
    await replaceSite(archive, await previewSiteReplacement(archive, options), options)
    const restore = backup
    await replaceSite(restore, await previewSiteReplacement(restore, options), options)
    expect((await payload.find({ collection: 'tags' })).docs[0]!.title).toBe('New production edit')
  }, 60000)
  it('rolls back database changes without deleting original media on failure', async () => {
    const archive = await exportSite(options)
    const originalMedia = (await payload.find({ collection: 'media' })).docs[0]!
    const config = payload.collections.posts!.config
    const previous = config.hooks.beforeChange
    config.hooks.beforeChange = [
      ...previous,
      () => {
        throw new Error('injected failure')
      },
    ]
    try {
      await expect(
        replaceSite(archive, await previewSiteReplacement(archive, options), options),
      ).rejects.toThrow('injected failure')
    } finally {
      config.hooks.beforeChange = previous
    }
    expect((await payload.find({ collection: 'posts', draft: true })).docs[0]!.title).toBe('Draft')
    expect(await readFile(join(folder, String(originalMedia.filename)))).toEqual(png)
  }, 60000)
  it('pauses native writes while a snapshot holds the site lock', async () => {
    let finished = false
    let pending: Promise<unknown> | undefined
    await options.withWriteLock(async () => {
      pending = payload
        .create({ collection: 'tags', data: { title: 'Concurrent', slug: 'concurrent' } })
        .then(() => {
          finished = true
        })
      await new Promise((resolve) => setTimeout(resolve, 40))
      expect(finished).toBe(false)
    })
    await pending
    expect(finished).toBe(true)
  })
  it('replays a committed operation without replacing later editorial changes', async () => {
    const archive = await exportSite(options)
    const preview = await previewSiteReplacement(archive, options)
    const operation = {
      ...options,
      completion: payloadReplacementReceipt(payload, 'site', 'receipt-test'),
    }
    const first = await replaceSite(archive, preview, operation)
    await payload.create({ collection: 'tags', data: { title: 'Later', slug: 'later' } })
    expect(await replaceSite(archive, preview, operation)).toEqual(first)
    expect(
      (await payload.find({ collection: 'tags', where: { slug: { equals: 'later' } } })).totalDocs,
    ).toBe(1)
  })
})
