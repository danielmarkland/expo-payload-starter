import {
  publishingErrorResponse,
  publishingNotFoundResponse,
  publishingValidationResponse,
  publishingCacheControl,
  validPreviewSecret,
} from '@danielmarkland/publishing-core/publishingHttp'
import {
  siteConfigRoute,
  siteMetadataRoute,
  navigationRoute,
  pageRoute,
  postsRoute,
  searchRoute,
  sitemapRoute,
  redirectsRoute,
  postRoute,
  contactRoute,
  newsletterRoute,
  publishingTaxonomyRoute,
  jsonContent,
  publishingSlugParams as slugParams,
  publishingErrorResponses as errors,
} from '@danielmarkland/publishing-contracts/publishingApi'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { cors } from 'hono/cors'

import { profileSchema } from '@danielmarkland/contracts'
import { getPreviewSecret } from '@/lib/serverConfig'
import { deliverContact, subscribeToNewsletter } from '@/lib/publishing/forms'
import {
  findPage,
  findPost,
  findPosts,
  findTaxonomy,
  getNavigation,
  getRedirectDocuments,
  getResolvedSiteConfig,
  getSiteMetadata,
  getSitemapEntries,
  searchContent,
} from '@/lib/publishing/repository'
import { getAuthenticatedProfile, updateAuthenticatedProfile } from '@/lib/profile/service'

export const apiApp = new OpenAPIHono({
  defaultHook: (result, context) => {
    if (!result.success) return context.json(publishingValidationResponse, 400)
  },
}).basePath('/api/v1')

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
  const cache = publishingCacheControl(context.req.raw, context.res.status)
  if (cache) context.header('cache-control', cache)
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

apiApp.openapi(createRoute(siteConfigRoute), async (context) =>
  context.json(await getResolvedSiteConfig(), 200),
)

apiApp.openapi(createRoute(siteMetadataRoute), async (context) =>
  context.json(await getSiteMetadata(), 200),
)

apiApp.openapi(createRoute(navigationRoute), async (context) =>
  context.json(await getNavigation(), 200),
)

apiApp.openapi(createRoute(pageRoute), async (context) => {
  const draft = validPreviewSecret(context.req.header('x-preview-secret'), getPreviewSecret)
  const page = await findPage(context.req.valid('param').slug, draft)
  return page ? context.json(page, 200) : notFound(context)
})

apiApp.openapi(createRoute(postsRoute), async (context) =>
  context.json(await findPosts(context.req.valid('query')), 200),
)

apiApp.openapi(createRoute(searchRoute), async (context) =>
  context.json(await searchContent(context.req.valid('query').q), 200),
)

apiApp.openapi(createRoute(sitemapRoute), async (context) =>
  context.json(await getSitemapEntries(), 200),
)

apiApp.openapi(createRoute(redirectsRoute), async (context) =>
  context.json(await getRedirectDocuments(), 200),
)

apiApp.openapi(createRoute(postRoute), async (context) => {
  const draft = validPreviewSecret(context.req.header('x-preview-secret'), getPreviewSecret)
  const post = await findPost(context.req.valid('param').slug, draft)
  return post ? context.json(post, 200) : notFound(context)
})

for (const path of ['authors', 'categories', 'tags'] as const) {
  apiApp.openapi(createRoute(publishingTaxonomyRoute(path)), async (context) => {
    const item = await findTaxonomy(path, context.req.valid('param').slug)
    return item ? context.json(item, 200) : notFound(context)
  })
}

apiApp.openapi(createRoute(contactRoute), async (context) => {
  await deliverContact(context.req.valid('json'), context.req.raw)
  return context.json({ ok: true as const }, 200)
})

apiApp.openapi(createRoute(newsletterRoute), async (context) => {
  await subscribeToNewsletter(context.req.valid('json'), context.req.raw)
  return context.json({ ok: true as const }, 200)
})

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
  const response = publishingErrorResponse(error)
  if (response.unexpected) console.error('API request failed.', error)
  return context.json(response.body, response.status)
})

function notFound(context: Parameters<Parameters<typeof apiApp.notFound>[0]>[0]) {
  return context.json(publishingNotFoundResponse, 404)
}
