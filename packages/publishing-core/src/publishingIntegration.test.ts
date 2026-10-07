import vm from 'node:vm'
import { themeBootstrapScript } from './siteConfig.js'
import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  createPublishingContentClient,
  createLegacyPublishingForwarder,
} from './contentClient.js'
import { createPreviewHandler, createPreviewURLBuilder } from './preview.js'
import {
  createAuthorsCollection,
  createPagesCollection,
  createMediaCollection,
  createPublishingAccess,
  authenticatedEditor,
  publicRead,
  publishedOrEditor,
} from './payloadCollections.js'
import {
  documentMetadata,
  publishedPostConditions,
  sitemapEntries,
  resolvePublishingSearchResults,
  createPublishingSearchOptions,
} from './publishingRules.js'
import {
  getSiteURL,
  getPreviewSecret,
  getStorageConfig,
  getPayloadStorageOptions,
} from './serverEnvironment.js'
import {
  createContactDelivery,
  createNewsletterDelivery,
} from './formDelivery.js'
import {
  ServiceUnavailableError,
  ValidationError,
  UpstreamError,
} from './serviceErrors.js'
import type { Access } from 'payload'
afterEach(() => vi.unstubAllGlobals())
const request = new Request('https://site.example/api/contact', {
  headers: { 'x-forwarded-for': '192.0.2.1,192.0.2.2' },
})
const submission = {
  name: '<Seller>',
  email: 'seller@example.com',
  message: '<script>\nHello',
  company: 'A&B',
  turnstileToken: 'token',
  website: '',
}
const credentials = {
  apiKey: 'server-key',
  fromAddress: 'sender@example.com',
  toAddress: 'owner@example.com',
  turnstileSecret: 'captcha-secret',
}
describe('shared publishing integration', () => {
  it('distinguishes missing documents from invalid JSON null and upstream failure', async () => {
    const transport = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(Response.json(null))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
    const client = createPublishingContentClient(transport)
    expect(await client.getPage('missing')).toBeNull()
    await expect(client.getPage('invalid')).rejects.toThrow()
    await expect(client.getPost('unavailable')).rejects.toThrow('503')
  })
  it('encodes paths and forwards preview authorization only in draft mode', async () => {
    const transport = vi.fn().mockResolvedValue(
      Response.json({
        id: 1,
        title: 'Page',
        slug: 'a/b',
        layout: [],
        _status: 'draft',
      }),
    )
    const client = createPublishingContentClient(transport, {
      enabled: async () => true,
      getSecret: () => 'secret',
    })
    await client.getPage('a/b')
    expect(transport).toHaveBeenCalledWith('/pages/a%2Fb', {
      headers: { 'x-preview-secret': 'secret' },
    })
  })
  it('forwards legacy requests without discarding request headers or error status', async () => {
    const transport = vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: { message: 'Not available' } }, { status: 503 }),
      )
    const response = await createLegacyPublishingForwarder(transport)(
      new Request('https://site.example/api/contact', {
        method: 'POST',
        headers: { 'x-custom': 'value' },
        body: '{}',
      }),
      '/contact',
    )
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'Not available' })
    expect(response.headers.get('deprecation')).toBe('true')
    expect(transport.mock.calls[0][1].headers.get('x-custom')).toBe('value')
  })
  it('builds admin previews from the actual Payload document callback contract', async () => {
    const getSiteURL = vi.fn(async (doc) => `https://${doc.tenant}.example`)
    const preview = createPreviewURLBuilder({
      getSecret: () => 'secret&value',
      getSiteURL,
    })('pages')
    expect(await preview({ tenant: 'tenant-a', slug: 'a/b' })).toBe(
      'https://tenant-a.example/api/preview?collection=pages&slug=a%2Fb&secret=secret%26value',
    )
    expect(getSiteURL).toHaveBeenCalledWith({ tenant: 'tenant-a', slug: 'a/b' })
  })
  it('never enables draft mode for invalid preview requests', async () => {
    const enableDraftMode = vi.fn(),
      redirect = vi.fn((path: string): never => {
        throw new Error(path)
      })
    const handler = createPreviewHandler({
      getSecret: () => 'secret',
      enableDraftMode,
      redirect,
    })
    expect(
      (
        await handler(
          new Request(
            'https://site.example/api/preview?secret=wrong&slug=home',
          ),
        )
      )?.status,
    ).toBe(401)
    expect(
      (
        await handler(
          new Request(
            'https://site.example/api/preview?secret=secret&slug=home&collection=users',
          ),
        )
      )?.status,
    ).toBe(401)
    expect(enableDraftMode).not.toHaveBeenCalled()
    await expect(
      handler(
        new Request(
          'https://site.example/api/preview?secret=secret&slug=home&collection=pages',
        ),
      ),
    ).rejects.toThrow('/')
    expect(enableDraftMode).toHaveBeenCalledOnce()
  })
  it('keeps single-site defaults and tenant uniqueness/access explicit', async () => {
    const access = createPublishingAccess(authenticatedEditor)
    const site = createAuthorsCollection({
      access: createPublishingAccess(publicRead),
    })
    const tenant = createAuthorsCollection({
      access,
      uniqueSlug: false,
      indexes: [{ fields: ['tenant', 'slug'], unique: true }],
    })
    expect(
      site.fields.find((field) => 'name' in field && field.name === 'slug'),
    ).toMatchObject({ unique: true })
    expect(
      tenant.fields.find((field) => 'name' in field && field.name === 'slug'),
    ).toMatchObject({ unique: false })
    expect(tenant.indexes).toEqual([
      { fields: ['tenant', 'slug'], unique: true },
    ])
    const args = { req: { user: null } } as unknown as Parameters<Access>[0]
    expect(await site.access!.read!(args)).toBe(true)
    expect(await tenant.access!.read!(args)).toBe(false)
    expect(await publishedOrEditor(args)).toEqual({
      _status: { equals: 'published' },
    })
    const pages = createPagesCollection({
      access,
      pageBlocks: [],
      preview: async () => '/api/preview',
    })
    expect(pages.versions).toEqual({ drafts: true })
    expect(createMediaCollection({ access }).upload).toBe(true)
  })
  it('does not share mutable access or index objects across collections', () => {
    const access = createPublishingAccess(authenticatedEditor),
      indexes = [{ fields: ['tenant', 'slug'], unique: true }]
    const first = createAuthorsCollection({ access, indexes }),
      second = createAuthorsCollection({ access, indexes })
    first.access!.read = publicRead
    first.indexes![0].fields.push('changed')
    expect(second.access!.read).toBe(authenticatedEditor)
    expect(second.indexes![0].fields).toEqual(['tenant', 'slug'])
    expect(indexes[0].fields).toEqual(['tenant', 'slug'])
  })
  it('resolves only supported indexed documents and never emits draft or missing targets', async () => {
    const resolve = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        slug: 'draft',
        title: 'Draft',
        _status: 'draft',
      })
      .mockResolvedValueOnce({
        slug: 'a/b',
        title: 'Published',
        _status: 'published',
        meta: { title: 'SEO' },
      })
    const result = await resolvePublishingSearchResults(
      [
        { id: 1, doc: { relationTo: 'users', value: 1 } },
        { id: 2, doc: { relationTo: 'pages', value: { id: 2 } } },
        { id: 3, doc: { relationTo: 'pages', value: 3 } },
        { id: 4, doc: { relationTo: 'posts', value: 4 } },
        { id: 5, doc: { relationTo: 'posts', value: 5 } },
      ],
      resolve,
    )
    expect(resolve).toHaveBeenCalledTimes(3)
    expect(result.results).toEqual([
      { id: 5, href: '/posts/a%2Fb', title: 'SEO', summary: '' },
    ])
  })
  it('requires a configured origin and derives stable secret material', () => {
    expect(() => getSiteURL({})).toThrow('SITE_URL')
    expect(getSiteURL({ SITE_URL: 'https://site.example/' })).toBe(
      'https://site.example',
    )
    expect(getPreviewSecret({ PAYLOAD_SECRET: 'one' })).not.toBe(
      getPreviewSecret({ PAYLOAD_SECRET: 'two' }),
    )
  })
  it('preserves metadata fallback, encoded sitemap paths and shared search rules', () => {
    expect(
      documentMetadata(
        { title: 'Title', slug: 'home', meta: {}, layout: [] } as never,
        'Fallback',
      ),
    ).toMatchObject({ title: 'Title', description: 'Fallback' })
    expect(
      sitemapEntries(
        [
          { slug: 'home', updatedAt: 'date' },
          { slug: 'a/b', updatedAt: 'date' },
        ],
        [],
      ).entries,
    ).toEqual([{ path: '/a%2Fb', updatedAt: 'date' }])
    expect(publishedPostConditions({ authorId: 2 })).toEqual([
      { _status: { equals: 'published' } },
      { author: { equals: 2 } },
    ])
    expect(
      createPublishingSearchOptions().beforeSync({
        collectionSlug: 'posts',
        originalDoc: { summary: 'Summary' },
        searchDoc: { id: 1 },
      }),
    ).toMatchObject({ id: 1, excerpt: 'Summary' })
  })
  it('validates captcha action and escapes contact content including company', async () => {
    const send = vi.fn().mockResolvedValue(undefined),
      fetch = vi
        .fn()
        .mockResolvedValue(Response.json({ success: true, action: 'contact' }))
    vi.stubGlobal('fetch', fetch)
    const deliver = createContactDelivery({
      getEmailConfig: () => credentials,
      getSendEmail: async () => send,
    })
    await deliver(submission, request)
    expect(send.mock.calls[0][0].html).toContain('&lt;Seller&gt;')
    expect(send.mock.calls[0][0].html).toContain('A&amp;B')
    expect(send.mock.calls[0][0].html).not.toContain('<script>')
    expect(fetch.mock.calls[0][1].body.get('remoteip')).toBe('192.0.2.1')
    fetch.mockResolvedValueOnce(
      Response.json({ success: true, action: 'newsletter' }),
    )
    await expect(deliver(submission, request)).rejects.toBeInstanceOf(
      ValidationError,
    )
    expect(send).toHaveBeenCalledOnce()
  })
  it('does not initialize providers for honeypots or missing configuration', async () => {
    const transport = vi.fn(),
      fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const deliver = createContactDelivery({
      getEmailConfig: () => ({ ...credentials, apiKey: null }),
      getSendEmail: transport,
    })
    await deliver({ ...submission, website: 'spam' }, request)
    await expect(deliver(submission, request)).rejects.toBeInstanceOf(
      ServiceUnavailableError,
    )
    expect(transport).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('uses the host-selected newsletter group and exposes provider failure', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ success: true, action: 'newsletter' }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
    vi.stubGlobal('fetch', fetch)
    const subscribe = createNewsletterDelivery({
      getNewsletterConfig: () => ({
        apiKey: 'server-key',
        turnstileSecret: 'captcha-secret',
      }),
      getNewsletterGroup: async () => 'tenant-group',
    })
    await expect(
      subscribe(
        {
          email: 'seller@example.com',
          firstName: 'First',
          lastName: 'Last',
          turnstileToken: 'token',
          website: '',
        },
        request,
      ),
    ).rejects.toBeInstanceOf(UpstreamError)
    expect(JSON.parse(fetch.mock.calls[1][1].body).groups).toEqual([
      'tenant-group',
    ])
  })
})

describe('theme preference before hydration', () => {
  it.each([
    [true, 'dark', 'light', true, 'light'],
    [false, 'dark', 'light', true, 'dark'],
    [true, 'system', null, true, 'light'],
    [true, 'system', 'invalid', false, 'dark'],
  ] as const)(
    'resolves saved, forced, and system preferences',
    (allowToggle, defaultMode, saved, light, expected) => {
      const dataset: Record<string, string> = {}
      vm.runInNewContext(
        themeBootstrapScript(
          { allowToggle, defaultMode } as Parameters<
            typeof themeBootstrapScript
          >[0],
          'theme',
        ),
        {
          localStorage: { getItem: () => saved },
          matchMedia: () => ({ matches: light }),
          document: { documentElement: { dataset } },
        },
      )
      expect(dataset.theme).toBe(expected)
    },
  )
  it('escapes script delimiters in the configured storage key', () => {
    expect(
      themeBootstrapScript(
        { allowToggle: true, defaultMode: 'dark' } as Parameters<
          typeof themeBootstrapScript
        >[0],
        '</script>',
      ),
    ).not.toContain('</script>')
  })
})

describe('configured media transport', () => {
  it('disables remote storage without credentials and keeps complete configured transport', () => {
    expect(getPayloadStorageOptions(getStorageConfig({})).enabled).toBe(false)
    const options = getPayloadStorageOptions(
      getStorageConfig({
        SUPABASE_S3_ACCESS_KEY_ID: 'key',
        SUPABASE_S3_SECRET_ACCESS_KEY: 'secret',
        SUPABASE_S3_ENDPOINT: 'http://local-storage',
        SUPABASE_S3_REGION: 'local',
      }),
    )
    expect(options.enabled).toBe(true)
    expect(options.config.endpoint).toBe('http://local-storage')
    expect(options.config.forcePathStyle).toBe(true)
  })
})
