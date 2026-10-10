import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildConfig, getPayload, type Payload, type CollectionSlug } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  decodeSiteArchive,
  encodeSiteArchive,
  exportSite,
  previewSiteReplacement,
  replaceSite,
  publishingTransferResources,
  sha256,
  type SiteTransferOptions,
} from '@danielmarkland/publishing-core/siteTransfer'
import { createFooterNavigationFields } from '@danielmarkland/publishing-core/payloadNavigation'

const url = process.env.SITE_TRANSFER_REPAIR_DATABASE_URL
if (
  url &&
  (!['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ||
    new URL(url).pathname !== '/publishing_site_transfer_repair_tests')
)
  throw new Error(
    'Only the disposable local publishing_site_transfer_repair_tests database is allowed',
  )

// Exercise the real cloud-storage hooks with a byte-preserving storage adapter.
// Local static-file tests cannot observe request-context upload replay.
describe.skipIf(!url)('cloud-storage site transfer', () => {
  let payload: Payload
  let folder: string
  let options: SiteTransferOptions
  const stored = new Map<string, Buffer>()
  let corruptUpload = false
  let corruptMetadataUpdate = false
  const writes: { filename: string; hash: string; operation: string }[] = []
  const footerFields = createFooterNavigationFields({
    appearanceField: () => ({
      name: 'appearance',
      type: 'group',
      fields: [{ name: 'surface', type: 'text' }],
    }),
    navigationItemsField: () => ({
      name: 'items',
      type: 'array',
      fields: [{ name: 'label', type: 'text' }],
    }),
    linkArrayPresentation: {},
    socialLinkFields: () => [],
    submitButtonFields: () => [],
  })
  beforeAll(async () => {
    folder = await mkdtemp(join(tmpdir(), 'cloud-transfer-regression-'))
    payload = await getPayload({
      config: await buildConfig({
        secret: 'disposable-cloud-transfer-test',
        typescript: { autoGenerate: false },
        sharp,
        db: postgresAdapter({ pool: { connectionString: url }, push: true }),
        collections: [
          { slug: 'users', auth: true, fields: [] },
          {
            slug: 'media',
            hooks: {
              afterChange: [
                ({ doc, operation, req }) => {
                  if (corruptMetadataUpdate && operation === 'update' && req.context.siteTransfer)
                    stored.set(String(doc.filename), Buffer.from('corrupt metadata update'))
                  return doc
                },
              ],
            },
            upload: { staticDir: folder },
            fields: [{ name: 'alt', type: 'text', required: true }],
          },
          { slug: 'footer-navigation', fields: footerFields },
        ],
        plugins: [
          cloudStoragePlugin({
            collections: {
              media: {
                disableLocalStorage: true,
                adapter: () => ({
                  name: 'byte-preserving-test-storage',
                  handleUpload: ({ file, req }) => {
                    writes.push({
                      filename: file.filename,
                      hash: sha256(file.buffer),
                      operation: String(req.context.testPhase || 'seed'),
                    })
                    stored.set(
                      file.filename,
                      corruptUpload ? Buffer.from('corrupt upload') : Buffer.from(file.buffer),
                    )
                  },
                  // Transfer backups must retain originals after document deletion.
                  handleDelete: () => {},
                  staticHandler: () => new Response(null, { status: 404 }),
                }),
              },
            },
          }),
        ],
      }),
    })
    for (const collection of ['footer-navigation', 'media'] as const)
      await payload.delete({ collection: collection as CollectionSlug, where: {} })
    options = {
      payload,
      resources: publishingTransferResources(payload, false),
      readMedia: async (doc) => {
        const bytes = stored.get(String(doc.filename))
        if (!bytes) throw new Error('Missing stored original')
        return bytes
      },
      withWriteLock: async (work) => work(),
      saveBackup: async () => 'test-backup',
    }
  }, 60000)
  afterAll(async () => {
    await payload?.destroy()
    if (folder) await rm(folder, { recursive: true, force: true })
  })
  it('keeps distinct originals through metadata updates, export/reimport and repeated replacement', async () => {
    const originals = [
      {
        name: 'red.png',
        mime: 'image/png',
        bytes: await sharp({ create: { width: 13, height: 7, channels: 3, background: '#ff0000' } })
          .png()
          .toBuffer(),
      },
      {
        name: 'blue.jpg',
        mime: 'image/jpeg',
        bytes: await sharp({
          create: { width: 23, height: 11, channels: 3, background: '#0000ff' },
        })
          .jpeg()
          .toBuffer(),
      },
      {
        name: 'green.svg',
        mime: 'image/svg+xml',
        bytes: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="31" height="17"><rect width="31" height="17" fill="green"/></svg>',
        ),
      },
    ]
    for (const original of originals)
      await payload.create({
        collection: 'media',
        data: { alt: original.name },
        file: {
          data: original.bytes,
          name: original.name,
          mimetype: original.mime,
          size: original.bytes.length,
        },
      })
    const expected = Object.fromEntries(
      originals.map((original) => [original.name, sha256(original.bytes)]),
    )
    let archive = await exportSite(options)
    for (let round = 0; round < 3; round++) {
      writes.length = 0
      const transferOptions = { ...options, req: { context: { testPhase: `import-${round}` } } }
      const preview = await previewSiteReplacement(archive, transferOptions)
      await replaceSite(archive, preview, transferOptions)
      const media = await payload.find({ collection: 'media', pagination: false })
      expect(
        Object.fromEntries(
          media.docs.map((doc) => [doc.alt, sha256(stored.get(String(doc.filename))!)]),
        ),
      ).toEqual(expected)
      // Each original is uploaded once; resolving references must not upload cached bytes again.
      expect(writes).toHaveLength(originals.length)
      const exported = decodeSiteArchive(await exportSite(options))
      expect(exported.manifest.assets.map((asset) => asset.sha256).sort()).toEqual(
        Object.values(expected).sort(),
      )
      archive = encodeSiteArchive(exported)
    }
  }, 60000)
  it.each([null, undefined])(
    'imports disabled footer groups represented as %s',
    async (value) => {
      const archive = decodeSiteArchive(await exportSite(options))
      archive.manifest.records.push({
        key: 'footer',
        resource: 'footer-navigation',
        draft: false,
        current: {
          data: value === null ? { newsletter: null, contactForm: null } : {},
          references: [],
        },
      })
      const bytes = encodeSiteArchive(archive)
      const preview = await previewSiteReplacement(bytes, options)
      await replaceSite(bytes, preview, options)
      const footer = (await payload.find({ collection: 'footer-navigation' as CollectionSlug }))
        .docs[0] as unknown as { newsletter?: { show?: boolean }; contactForm?: { show?: boolean } }
      expect(footer.newsletter?.show).toBe(false)
      expect(footer.contactForm?.show).toBe(false)
      await payload.delete({ collection: 'footer-navigation' as CollectionSlug, where: {} })
    },
    60000,
  )
  it.each(['upload', 'metadata'])(
    'rejects corruption during %s and rolls back the destination',
    async (phase) => {
      const archive = await exportSite(options)
      const before = (await payload.find({ collection: 'media', sort: 'id', pagination: false }))
        .docs
      const preview = await previewSiteReplacement(archive, options)
      corruptUpload = phase === 'upload'
      corruptMetadataUpdate = phase === 'metadata'
      try {
        await expect(replaceSite(archive, preview, options)).rejects.toThrow(
          'Imported media verification failed',
        )
      } finally {
        corruptUpload = false
        corruptMetadataUpdate = false
      }
      expect(
        (await payload.find({ collection: 'media', sort: 'id', pagination: false })).docs,
      ).toEqual(before)
      expect(
        decodeSiteArchive(await exportSite(options))
          .manifest.assets.map((a) => a.sha256)
          .sort(),
      ).toEqual(
        decodeSiteArchive(archive)
          .manifest.assets.map((a) => a.sha256)
          .sort(),
      )
    },
  )
})
