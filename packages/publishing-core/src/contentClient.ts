import {
  authorSchema,
  pageSchema,
  postSchema,
  navigationSchema,
  paginatedPostsSchema,
  redirectsSchema,
  searchResultsSchema,
  sitemapEntriesSchema,
  taxonomySchema,
  siteConfigSchema,
  siteMetadataSchema,
  landingPageSchema,
  type LandingSurface,
  type ApiAuthor,
  type ApiTaxonomy,
} from '@danielmarkland/publishing-contracts'
export type PublishingRequest = (
  path: string,
  init?: RequestInit,
) => Response | Promise<Response>
const notFound = Symbol('missing publishing document')
export function createPublishingContentClient(
  request: PublishingRequest,
  preview?: {
    enabled: () => boolean | Promise<boolean>
    getSecret: () => string
  },
) {
  async function json(
    path: string,
    label: string,
    init?: RequestInit,
    allowMissing = false,
  ) {
    const response = await request(path, init)
    if (allowMissing && response.status === 404) return notFound
    if (!response.ok)
      throw new Error(`${label} API request failed (${response.status}).`)
    return response.json()
  }
  async function document(collection: 'pages' | 'posts', slug: string) {
    const enabled = preview ? await preview.enabled() : false
    const value = await json(
      `/${collection}/${encodeURIComponent(slug)}`,
      collection === 'pages' ? 'Page' : 'Post',
      {
        headers: enabled
          ? { 'x-preview-secret': preview!.getSecret() }
          : undefined,
      },
      true,
    )
    return value
  }
  function getTaxonomyDocument(
    collection: 'authors',
    slug: string,
  ): Promise<ApiAuthor | null>
  function getTaxonomyDocument(
    collection: 'categories' | 'tags',
    slug: string,
  ): Promise<ApiTaxonomy | null>
  function getTaxonomyDocument(
    collection: 'authors' | 'categories' | 'tags',
    slug: string,
  ): Promise<ApiAuthor | ApiTaxonomy | null>
  async function getTaxonomyDocument(
    collection: 'authors' | 'categories' | 'tags',
    slug: string,
  ) {
    const value = await json(
      `/${collection}/${encodeURIComponent(slug)}`,
      'Taxonomy',
      undefined,
      true,
    )
    return value === notFound
      ? null
      : collection === 'authors'
        ? authorSchema.parse(value)
        : taxonomySchema.parse(value)
  }
  return {
    async getPage(slug: string) {
      const value = await document('pages', slug)
      return value === notFound ? null : pageSchema.parse(value)
    },
    async getPost(slug: string) {
      const value = await document('posts', slug)
      return value === notFound ? null : postSchema.parse(value)
    },
    async getNavigationDocuments() {
      return navigationSchema.parse(await json('/navigation', 'Navigation'))
    },
    async getPublishedPosts(query = '') {
      return paginatedPostsSchema.parse(await json(`/posts${query}`, 'Posts'))
    },
    getTaxonomyDocument,
    async getSearchResults(query: string) {
      return searchResultsSchema.parse(
        await json(`/search?q=${encodeURIComponent(query)}`, 'Search'),
      ).results
    },
    async getSitemapDocuments() {
      return sitemapEntriesSchema.parse(await json('/sitemap', 'Sitemap'))
        .entries
    },
    async getRedirectDocuments(init?: RequestInit) {
      return redirectsSchema.parse(await json('/redirects', 'Redirect', init))
        .redirects
    },
    async getLandingPage(surface: LandingSurface) {
      const value = await json(
        `/landing-pages/${surface}`,
        'Landing page',
        undefined,
        true,
      )
      return value === notFound ? null : landingPageSchema.parse(value)
    },
    async getSitePresentation() {
      const [config, metadata] = await Promise.all([
        request('/site-config'),
        request('/site-metadata'),
      ])
      if (!config.ok || !metadata.ok)
        throw new Error('Site presentation API request failed.')
      return {
        config: siteConfigSchema.parse(await config.json()),
        metadata: siteMetadataSchema.parse(await metadata.json()),
      }
    },
  }
}
export function createLegacyPublishingForwarder(request: PublishingRequest) {
  return async (incoming: Request, path: string) => {
    const headers = new Headers(incoming.headers)
    const body =
      incoming.method === 'GET' || incoming.method === 'HEAD'
        ? undefined
        : await incoming.text()
    const response = await request(path, {
      body,
      headers,
      method: incoming.method,
    })
    let forwarded: Response
    if (!response.ok) {
      const value = (await response.json().catch(() => null)) as {
        error?: { message?: string } | string
      } | null
      forwarded = Response.json(
        {
          error:
            typeof value?.error === 'string'
              ? value.error
              : value?.error?.message || 'The request could not be completed.',
        },
        { status: response.status },
      )
    } else forwarded = new Response(response.body, response)
    forwarded.headers.set('deprecation', 'true')
    forwarded.headers.set('link', `</api/v1${path}>; rel="successor-version"`)
    return forwarded
  }
}
