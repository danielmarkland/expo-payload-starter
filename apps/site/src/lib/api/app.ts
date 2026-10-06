import { selectedPostIDsSchema } from '@danielmarkland/publishing-core/postSelection'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { cors } from 'hono/cors'

import { profileSchema } from '@danielmarkland/contracts'
import {
  apiErrorSchema,
  apiOkSchema,
  authorSchema,
  contactSubmissionSchema,
  navigationSchema,
  newsletterSubmissionSchema,
  pageSchema,
  paginatedPostsSchema,
  postSchema,
  redirectsSchema,
  searchResultsSchema,
  siteConfigSchema,
  siteMetadataSchema,
  sitemapEntriesSchema,
  taxonomySchema,
} from '@danielmarkland/publishing-contracts'
import { getPreviewSecret } from '@/lib/serverConfig'
import {
  deliverContact,
  findPage,
  findPost,
  findPosts,
  findTaxonomy,
  getAuthenticatedProfile,
  getNavigation,
  getRedirectDocuments,
  getResolvedSiteConfig,
  getSiteMetadata,
  getSitemapEntries,
  ServiceUnavailableError,
  searchContent,
  subscribeToNewsletter,
  UnauthorizedError,
  UpstreamError,
  updateAuthenticatedProfile,
  ValidationError,
} from '@/lib/api/services'

const jsonContent = (schema: z.ZodType, description: string) => ({
  content: { 'application/json': { schema } },
  description,
})
const errors = {
  400: jsonContent(apiErrorSchema, 'Invalid request'),
  401: jsonContent(apiErrorSchema, 'Authentication required'),
  404: jsonContent(apiErrorSchema, 'Resource not found'),
  500: jsonContent(apiErrorSchema, 'Unexpected server error'),
  503: jsonContent(apiErrorSchema, 'Service unavailable'),
}
const slugParams = z.object({
  slug: z
    .string()
    .min(1)
    .openapi({ param: { in: 'path', name: 'slug' } }),
})

export const apiApp = new OpenAPIHono().basePath('/api/v1')

apiApp.use(
  '*',
  cors({
    allowHeaders: ['authorization', 'content-type', 'x-preview-secret'],
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    origin: '*',
  }),
)
apiApp.use('*', async (context, next) => {
  await next()
  const path = context.req.path
  if (
    path.includes('/me/') ||
    context.req.method !== 'GET' ||
    context.req.header('x-preview-secret')
  ) {
    context.header('cache-control', 'no-store')
  } else if (!path.endsWith('/docs') && !path.endsWith('/openapi.json')) {
    context.header('cache-control', 'public, max-age=60, stale-while-revalidate=300')
  }
})

apiApp.doc('/openapi.json', {
  info: {
    description: 'Stable first-party API for the website and universal application.',
    title: 'Expo Payload Starter API',
    version: '1.0.0',
  },
  openapi: '3.0.0',
})
apiApp.get('/docs', swaggerUI({ url: '/api/v1/openapi.json' }))

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/site-config',
    responses: { 200: jsonContent(siteConfigSchema, 'Resolved site configuration'), ...errors },
    tags: ['Site'],
  }),
  async (context) => context.json(await getResolvedSiteConfig(), 200),
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/site-metadata',
    responses: { 200: jsonContent(siteMetadataSchema, 'Resolved site metadata'), ...errors },
    tags: ['Site'],
  }),
  async (context) => context.json(await getSiteMetadata(), 200),
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/navigation',
    responses: { 200: jsonContent(navigationSchema, 'Header and footer navigation'), ...errors },
    tags: ['Site'],
  }),
  async (context) => context.json(await getNavigation(), 200),
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/pages/{slug}',
    request: { params: slugParams },
    responses: { 200: jsonContent(pageSchema, 'Page'), ...errors },
    tags: ['Content'],
  }),
  async (context) => {
    const draft = validPreviewHeader(context.req.header('x-preview-secret'))
    const page = await findPage(context.req.valid('param').slug, draft)
    return page ? context.json(page, 200) : notFound(context)
  },
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/posts',
    request: {
      query: z.object({
        ids: selectedPostIDsSchema.optional(),
        authorId: z.coerce.number().int().positive().optional(),
        categoryId: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(12),
        page: z.coerce.number().int().min(1).default(1),
        search: z.string().trim().min(1).max(200).optional(),
        tagId: z.coerce.number().int().positive().optional(),
      }),
    },
    responses: { 200: jsonContent(paginatedPostsSchema, 'Published posts'), ...errors },
    tags: ['Content'],
  }),
  async (context) => context.json(await findPosts(context.req.valid('query')), 200),
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/search',
    request: { query: z.object({ q: z.string().trim().min(2).max(120) }) },
    responses: { 200: jsonContent(searchResultsSchema, 'Search results'), ...errors },
    tags: ['Content'],
  }),
  async (context) => context.json(await searchContent(context.req.valid('query').q), 200),
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/sitemap',
    responses: { 200: jsonContent(sitemapEntriesSchema, 'Published sitemap entries'), ...errors },
    tags: ['Site'],
  }),
  async (context) => context.json(await getSitemapEntries(), 200),
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/redirects',
    responses: { 200: jsonContent(redirectsSchema, 'Configured redirects'), ...errors },
    tags: ['Site'],
  }),
  async (context) => context.json(await getRedirectDocuments(), 200),
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/posts/{slug}',
    request: { params: slugParams },
    responses: { 200: jsonContent(postSchema, 'Post'), ...errors },
    tags: ['Content'],
  }),
  async (context) => {
    const draft = validPreviewHeader(context.req.header('x-preview-secret'))
    const post = await findPost(context.req.valid('param').slug, draft)
    return post ? context.json(post, 200) : notFound(context)
  },
)

for (const [path, collection, schema] of [
  ['authors', 'authors', authorSchema],
  ['categories', 'categories', taxonomySchema],
  ['tags', 'tags', taxonomySchema],
] as const) {
  apiApp.openapi(
    createRoute({
      method: 'get',
      path: `/${path}/{slug}`,
      request: { params: slugParams },
      responses: { 200: jsonContent(schema, `Published ${path} entry`), ...errors },
      tags: ['Content'],
    }),
    async (context) => {
      const item = await findTaxonomy(collection, context.req.valid('param').slug)
      return item ? context.json(item, 200) : notFound(context)
    },
  )
}

apiApp.openapi(
  createRoute({
    method: 'post',
    path: '/contact',
    request: { body: { content: { 'application/json': { schema: contactSubmissionSchema } } } },
    responses: { 200: jsonContent(apiOkSchema, 'Message accepted'), ...errors },
    tags: ['Forms'],
  }),
  async (context) => {
    await deliverContact(context.req.valid('json'), context.req.raw)
    return context.json({ ok: true as const }, 200)
  },
)

apiApp.openapi(
  createRoute({
    method: 'post',
    path: '/newsletter',
    request: { body: { content: { 'application/json': { schema: newsletterSubmissionSchema } } } },
    responses: { 200: jsonContent(apiOkSchema, 'Subscription accepted'), ...errors },
    tags: ['Forms'],
  }),
  async (context) => {
    await subscribeToNewsletter(context.req.valid('json'), context.req.raw)
    return context.json({ ok: true as const }, 200)
  },
)

apiApp.openapi(
  createRoute({
    method: 'get',
    path: '/me/profile',
    responses: { 200: jsonContent(profileSchema, 'Authenticated profile'), ...errors },
    security: [{ bearerAuth: [] }],
    tags: ['Product'],
  }),
  async (context) => {
    const profile = await getAuthenticatedProfile(context.req.header('authorization') ?? null)
    return profile ? context.json(profile, 200) : notFound(context)
  },
)

apiApp.openapi(
  createRoute({
    method: 'patch',
    path: '/me/profile',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({ displayName: z.string().trim().max(100).nullable() }),
          },
        },
      },
    },
    responses: { 200: jsonContent(profileSchema, 'Updated profile'), ...errors },
    security: [{ bearerAuth: [] }],
    tags: ['Product'],
  }),
  async (context) =>
    context.json(
      await updateAuthenticatedProfile(
        context.req.header('authorization') ?? null,
        context.req.valid('json').displayName,
      ),
      200,
    ),
)

apiApp.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  bearerFormat: 'JWT',
  scheme: 'bearer',
  type: 'http',
})

apiApp.onError((error, context) => {
  if (error instanceof UnauthorizedError) {
    return context.json({ error: { code: 'unauthorized', message: error.message } }, 401)
  }
  if (error instanceof ValidationError) {
    return context.json({ error: { code: 'validation_error', message: error.message } }, 400)
  }
  if (error instanceof ServiceUnavailableError) {
    return context.json({ error: { code: 'unavailable', message: error.message } }, 503)
  }
  if (error instanceof UpstreamError) {
    return context.json({ error: { code: 'upstream_error', message: error.message } }, 502)
  }
  console.error('API request failed.', error)
  return context.json(
    { error: { code: 'internal_error', message: 'The request could not be completed.' } },
    500,
  )
})

function validPreviewHeader(value: string | undefined) {
  if (!value) return false
  try {
    return value === getPreviewSecret()
  } catch {
    return false
  }
}

function notFound(context: Parameters<Parameters<typeof apiApp.notFound>[0]>[0]) {
  return context.json({ error: { code: 'not_found', message: 'Resource not found.' } }, 404)
}
