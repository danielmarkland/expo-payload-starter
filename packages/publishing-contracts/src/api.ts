import { z } from 'zod'

export const apiErrorCodeSchema = z.enum([
  'bad_request',
  'forbidden',
  'internal_error',
  'not_found',
  'unauthorized',
  'unavailable',
  'upstream_error',
  'validation_error',
])

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
  }),
})

export const apiOkSchema = z.object({ ok: z.literal(true) })

export const mediaSchema = z.object({
  alt: z.string(),
  filename: z.string().nullable().optional(),
  height: z.number().nullable().optional(),
  id: z.union([z.number(), z.string()]),
  mimeType: z.string().nullable().optional(),
  thumbnailURL: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
})

export const taxonomySchema = z.object({
  description: z.string().nullable().optional(),
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
})

export const authorSchema = z.object({
  bio: z.string().nullable().optional(),
  id: z.union([z.number(), z.string()]),
  image: z.union([z.number(), z.string(), mediaSchema]).nullable().optional(),
  name: z.string(),
  slug: z.string(),
  website: z.string().nullable().optional(),
})

// Block payloads deliberately guarantee the discriminator while allowing each
// reusable block to evolve additively without versioning the entire API.
export const pageBlockSchema = z.looseObject({
  blockType: z.string(),
  id: z.string().nullable().optional(),
})

export const pageSchema = z.looseObject({
  _status: z.enum(['draft', 'published']).nullable().optional(),
  id: z.union([z.number(), z.string()]),
  layout: z.array(pageBlockSchema),
  slug: z.string(),
  title: z.string(),
})

export const postCardSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  publishedAt: z.string().nullable().optional(),
  meta: z
    .looseObject({
      image: z
        .union([z.number(), z.string(), mediaSchema])
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
})
export type PostCard = z.infer<typeof postCardSchema>

export const postSchema = postCardSchema.loose().extend({
  _status: z.enum(['draft', 'published']).nullable().optional(),
  body: z.record(z.string(), z.unknown()),
  id: z.union([z.number(), z.string()]),
  publishedAt: z.string().nullable().optional(),
  slug: z.string(),
  summary: z.string(),
  title: z.string(),
})

export const navigationSchema = z.object({
  footer: z.looseObject({}),
  header: z.looseObject({}),
})

export const siteMetadataSchema = z.object({
  description: z.string(),
  faviconUrl: z.string().nullable(),
  socialImageUrl: z.string().nullable(),
  title: z.string(),
})

export const paginationSchema = z.object({
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
  limit: z.number().int().positive(),
  nextPage: z.number().int().positive().nullable(),
  page: z.number().int().positive(),
  prevPage: z.number().int().positive().nullable(),
  totalDocs: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const paginatedPostsSchema = paginationSchema.extend({
  docs: z.array(postSchema),
})

export const searchResultSchema = z.object({
  href: z.string(),
  id: z.union([z.number(), z.string()]),
  summary: z.string(),
  title: z.string(),
})
export const searchResultsSchema = z.object({
  results: z.array(searchResultSchema),
})

export const sitemapEntriesSchema = z.object({
  entries: z.array(
    z.object({
      path: z.string(),
      updatedAt: z.string(),
    }),
  ),
})

export const redirectsSchema = z.object({
  redirects: z.array(z.looseObject({ from: z.string() })),
})

export type ApiError = z.infer<typeof apiErrorSchema>
export type ApiMedia = z.infer<typeof mediaSchema>
export type ApiPage = z.infer<typeof pageSchema>
export type ApiPost = z.infer<typeof postSchema>
export type ApiTaxonomy = z.infer<typeof taxonomySchema>
