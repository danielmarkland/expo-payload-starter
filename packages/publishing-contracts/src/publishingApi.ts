import { z } from 'zod'
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
  selectedPostIDsSchema,
} from './index.js'
export const jsonContent = (schema: z.ZodType, description: string) => ({
  content: { 'application/json': { schema } },
  description,
})
export const publishingErrorResponses = {
  400: jsonContent(apiErrorSchema, 'Invalid request'),
  401: jsonContent(apiErrorSchema, 'Authentication required'),
  403: jsonContent(apiErrorSchema, 'Insufficient access'),
  404: jsonContent(apiErrorSchema, 'Resource not found'),
  409: jsonContent(apiErrorSchema, 'Resource conflict'),
  500: jsonContent(apiErrorSchema, 'Unexpected server error'),
  502: jsonContent(apiErrorSchema, 'Upstream service error'),
  503: jsonContent(apiErrorSchema, 'Service unavailable'),
}
const errors = publishingErrorResponses
export const publishingSlugParams = z.object({
  slug: z
    .string()
    .min(1)
    .openapi({ param: { in: 'path', name: 'slug' } }),
})
const slugParams = publishingSlugParams
export const siteConfigRoute = {
  method: 'get' as const,
  path: '/site-config' as const,
  responses: {
    200: jsonContent(siteConfigSchema, 'Resolved site configuration'),
    ...errors,
  },
  tags: ['Site'],
}

export const siteMetadataRoute = {
  method: 'get' as const,
  path: '/site-metadata' as const,
  responses: {
    200: jsonContent(siteMetadataSchema, 'Resolved site metadata'),
    ...errors,
  },
  tags: ['Site'],
}

export const navigationRoute = {
  method: 'get' as const,
  path: '/navigation' as const,
  responses: {
    200: jsonContent(navigationSchema, 'Header and footer navigation'),
    ...errors,
  },
  tags: ['Site'],
}

export const pageRoute = {
  method: 'get' as const,
  path: '/pages/{slug}' as const,
  request: { params: slugParams },
  responses: { 200: jsonContent(pageSchema, 'Page'), ...errors },
  tags: ['Content'],
}

export const publishingPostsQuerySchema = z.object({
  ids: selectedPostIDsSchema.optional(),
  authorId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().min(1).max(200).optional(),
  tagId: z.coerce.number().int().positive().optional(),
})

export const postsRoute = {
  method: 'get' as const,
  path: '/posts' as const,
  request: {
    query: publishingPostsQuerySchema,
  },
  responses: {
    200: jsonContent(paginatedPostsSchema, 'Published posts'),
    ...errors,
  },
  tags: ['Content'],
}

export const searchRoute = {
  method: 'get' as const,
  path: '/search' as const,
  request: { query: z.object({ q: z.string().trim().min(2).max(120) }) },
  responses: {
    200: jsonContent(searchResultsSchema, 'Search results'),
    ...errors,
  },
  tags: ['Content'],
}

export const sitemapRoute = {
  method: 'get' as const,
  path: '/sitemap' as const,
  responses: {
    200: jsonContent(sitemapEntriesSchema, 'Published sitemap entries'),
    ...errors,
  },
  tags: ['Site'],
}

export const redirectsRoute = {
  method: 'get' as const,
  path: '/redirects' as const,
  responses: {
    200: jsonContent(redirectsSchema, 'Configured redirects'),
    ...errors,
  },
  tags: ['Site'],
}

export const postRoute = {
  method: 'get' as const,
  path: '/posts/{slug}' as const,
  request: { params: slugParams },
  responses: { 200: jsonContent(postSchema, 'Post'), ...errors },
  tags: ['Content'],
}

export const contactRoute = {
  method: 'post' as const,
  path: '/contact' as const,
  request: {
    body: {
      content: { 'application/json': { schema: contactSubmissionSchema } },
    },
  },
  responses: { 200: jsonContent(apiOkSchema, 'Message accepted'), ...errors },
  tags: ['Forms'],
}

export const newsletterRoute = {
  method: 'post' as const,
  path: '/newsletter' as const,
  request: {
    body: {
      content: { 'application/json': { schema: newsletterSubmissionSchema } },
    },
  },
  responses: {
    200: jsonContent(apiOkSchema, 'Subscription accepted'),
    ...errors,
  },
  tags: ['Forms'],
}
export function publishingTaxonomyRoute(
  path: 'authors' | 'categories' | 'tags',
) {
  return {
    method: 'get' as const,
    path: `/${path}/{slug}`,
    request: { params: publishingSlugParams },
    responses: {
      200: jsonContent(
        path === 'authors' ? authorSchema : taxonomySchema,
        `Published ${path} entry`,
      ),
      ...publishingErrorResponses,
    },
    tags: ['Content'],
  }
}
export type PublishingPostsQuery = z.infer<typeof publishingPostsQuerySchema>
