import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

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

export const mediaSchema = z.looseObject({
  alt: z.string(),
  filename: z.string().nullable().optional(),
  height: z.number().nullable().optional(),
  id: z.union([z.number(), z.string()]),
  mimeType: z.string().nullable().optional(),
  thumbnailURL: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
})

export const taxonomySchema = z.looseObject({
  description: z.string().nullable().optional(),
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
})

export const authorSchema = z.looseObject({
  bio: z.string().nullable().optional(),
  id: z.union([z.number(), z.string()]),
  image: z.union([z.number(), z.string(), mediaSchema]).nullable().optional(),
  name: z.string(),
  slug: z.string(),
  website: z.string().nullable().optional(),
})

// Populated references retain additive document fields without requiring a
// recursively populated page/post tree at every relationship depth.
const optionalText = z.string().nullable().optional()
const optionalBoolean = z.boolean().nullable().optional()
export const documentIDSchema = z.union([z.number(), z.string()])
export const documentReferenceSchema = z.looseObject({
  id: documentIDSchema,
  slug: z.string(),
  _status: z.enum(['draft', 'published']).nullable().optional(),
})
export const documentRelationshipSchema = z.union([
  documentIDSchema,
  documentReferenceSchema,
])
export const mediaRelationshipSchema = z.union([documentIDSchema, mediaSchema])

// Lexical plugins add node fields. Validate the tree and preserve those fields.
export const richTextNodeSchema = z
  .looseObject({
    type: z.string(),
    version: z.number(),
    text: z.string().optional(),
    tag: z.string().optional(),
    $: z.looseObject({ tone: z.string().optional() }).optional(),
    get children(): z.ZodOptional<z.ZodArray<typeof richTextNodeSchema>> {
      return z.array(richTextNodeSchema).optional()
    },
  })
  .openapi('PublishingRichTextNode')
export const richTextSchema = z.looseObject({
  root: richTextNodeSchema.extend({
    children: z.array(richTextNodeSchema),
    direction: z.enum(['ltr', 'rtl']).nullable(),
    format: z.enum(['left', 'start', 'center', 'right', 'end', 'justify', '']),
    indent: z.number(),
  }),
})
export const buttonVariantSchema = z.enum([
  'primary-filled',
  'primary-outline',
  'secondary-filled',
  'secondary-outline',
])
export const linkSchema = z.looseObject({
  id: optionalText,
  label: optionalText,
  type: z.enum(['page', 'post', 'url']).nullable().optional(),
  page: documentRelationshipSchema.nullable().optional(),
  post: documentRelationshipSchema.nullable().optional(),
  url: optionalText,
  newTab: optionalBoolean,
  icon: optionalText,
  iconOnly: optionalBoolean,
  iconPosition: z.enum(['left', 'right']).nullable().optional(),
  variant: buttonVariantSchema.nullable().optional(),
})
const spacing = z.enum(['none', 'sm', 'md', 'lg', 'xl']).nullable().optional()
const border = z.enum(['default', 'none', 'accent']).nullable().optional()
export const sectionAppearanceSchema = z.looseObject({
  contentWidth: z
    .enum(['default', 'text', 'wide', 'full'])
    .nullable()
    .optional(),
  background: z
    .enum(['default', 'raised', 'accent', 'dark'])
    .nullable()
    .optional(),
  rounded: optionalBoolean,
  paddingTop: spacing,
  paddingRight: spacing,
  paddingBottom: spacing,
  paddingLeft: spacing,
  marginTop: spacing,
  marginRight: spacing,
  marginBottom: spacing,
  marginLeft: spacing,
  borderTop: border,
  borderRight: border,
  borderBottom: border,
  borderLeft: border,
  borderWidth: z.enum(['thin', 'medium', 'thick']).nullable().optional(),
})
const blockBase = z.looseObject({
  id: optionalText,
  blockName: optionalText,
  anchor: optionalText,
  eyebrow: optionalText,
  heading: optionalText,
  appearance: sectionAppearanceSchema.nullable().optional(),
})
const action = linkSchema.nullable().optional()
const itemBase = z.looseObject({ id: optionalText })
const formFields = {
  heading: z.string(),
  body: optionalText,
  submitLabel: z.string(),
  successMessage: z.string(),
  icon: optionalText,
  iconPosition: z.enum(['left', 'right']).nullable().optional(),
  submitButtonVariant: buttonVariantSchema.nullable().optional(),
}
export const pageBlockSchema = z.discriminatedUnion('blockType', [
  blockBase.extend({
    blockType: z.literal('hero'),
    heading: richTextSchema,
    secondaryHeading: optionalText,
    body: optionalText,
    primaryButton: action,
    secondaryButton: action,
    image: mediaRelationshipSchema.nullable().optional(),
  }),
  blockBase.extend({
    blockType: z.literal('richText'),
    content: richTextSchema,
  }),
  blockBase.extend({
    blockType: z.literal('image'),
    image: mediaRelationshipSchema,
    caption: optionalText,
  }),
  blockBase.extend({
    blockType: z.literal('featureGrid'),
    heading: z.string(),
    intro: optionalText,
    layout: z.enum(['cards', 'stacked']).nullable().optional(),
    action,
    items: z
      .array(itemBase.extend({ title: z.string(), description: z.string() }))
      .nullable()
      .optional(),
  }),
  blockBase.extend({
    blockType: z.literal('splitContent'),
    heading: z.string(),
    content: richTextSchema,
    image: mediaRelationshipSchema,
    imagePosition: z.enum(['left', 'right']),
    action,
  }),
  blockBase.extend({
    blockType: z.literal('linkGrid'),
    heading: z.string(),
    intro: optionalText,
    action,
    items: z
      .array(linkSchema.extend({ label: z.string() }))
      .nullable()
      .optional(),
  }),
  blockBase.extend({
    blockType: z.literal('portfolioGrid'),
    heading: z.string(),
    intro: optionalText,
    action,
    items: z
      .array(
        linkSchema.extend({
          name: z.string(),
          role: optionalText,
          description: z.string(),
        }),
      )
      .nullable()
      .optional(),
  }),
  blockBase.extend({
    blockType: z.literal('callToAction'),
    heading: z.string(),
    body: optionalText,
    action: linkSchema,
  }),
  blockBase.extend({
    blockType: z.literal('testimonials'),
    items: z
      .array(
        itemBase.extend({
          quote: z.string(),
          name: z.string(),
          role: optionalText,
        }),
      )
      .nullable()
      .optional(),
  }),
  blockBase.extend({
    blockType: z.literal('logoCloud'),
    intro: optionalText,
    items: z
      .array(
        linkSchema.extend({ name: z.string(), image: mediaRelationshipSchema }),
      )
      .nullable()
      .optional(),
  }),
  blockBase.extend({ blockType: z.literal('contactForm'), ...formFields }),
  blockBase.extend({
    blockType: z.literal('stats'),
    items: z
      .array(itemBase.extend({ value: z.string(), label: z.string() }))
      .nullable()
      .optional(),
  }),
  blockBase.extend({
    blockType: z.literal('faq'),
    items: z
      .array(itemBase.extend({ question: z.string(), answer: z.string() }))
      .nullable()
      .optional(),
  }),
  blockBase.extend({
    blockType: z.literal('latestPosts'),
    limit: z.number().nullable().optional(),
  }),
])
export const contentMetaSchema = z.looseObject({
  title: optionalText,
  description: optionalText,
  image: mediaRelationshipSchema.nullable().optional(),
})
export const pageSchema = z.looseObject({
  _status: z.enum(['draft', 'published']).nullable().optional(),
  id: documentIDSchema,
  layout: z.array(pageBlockSchema),
  slug: z.string(),
  title: z.string(),
  customCSS: optionalText,
  meta: contentMetaSchema.nullable().optional(),
  createdAt: optionalText,
  updatedAt: optionalText,
})
export const postCardSchema = z.looseObject({
  id: documentIDSchema,
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  publishedAt: optionalText,
  meta: contentMetaSchema.nullable().optional(),
})
export type PostCard = z.infer<typeof postCardSchema>
export const postSchema = postCardSchema.extend({
  _status: z.enum(['draft', 'published']).nullable().optional(),
  body: richTextSchema,
  author: z.union([documentIDSchema, authorSchema]).nullable().optional(),
  categories: z
    .array(z.union([documentIDSchema, taxonomySchema]))
    .nullable()
    .optional(),
  tags: z
    .array(z.union([documentIDSchema, taxonomySchema]))
    .nullable()
    .optional(),
  showTableOfContents: optionalBoolean,
  createdAt: optionalText,
  updatedAt: optionalText,
})
const navigationItemSchema = linkSchema.extend({
  label: z.string(),
  type: z.enum(['page', 'post', 'url']),
})
export const headerNavigationSchema = z.looseObject({
  id: documentIDSchema.optional(),
  items: z.array(navigationItemSchema).nullable().optional(),
  sticky: optionalBoolean,
  showSearch: z.boolean(),
  searchIcon: optionalText,
})
const footerFormSchema = blockBase.extend({ ...formFields, show: z.boolean() })
export const footerNavigationSchema = z.looseObject({
  id: documentIDSchema.optional(),
  tagline: optionalText,
  copyrightOwner: optionalText,
  items: z.array(navigationItemSchema).nullable().optional(),
  newsletter: footerFormSchema
    .extend({ groupId: optionalText, consentText: optionalText })
    .nullable()
    .optional(),
  contactForm: footerFormSchema.nullable().optional(),
  latestPosts: z
    .looseObject({ show: z.boolean(), heading: optionalText })
    .nullable()
    .optional(),
  socialLinks: z
    .array(
      linkSchema.extend({
        label: z.string(),
        icon: z.string(),
        url: z.string(),
      }),
    )
    .nullable()
    .optional(),
})
export const navigationSchema = z.object({
  footer: footerNavigationSchema,
  header: headerNavigationSchema,
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

export const redirectSchema = z.looseObject({
  id: documentIDSchema.optional(),
  from: z.string(),
  type: z.enum(['301', '302']),
  to: z
    .looseObject({
      type: z.enum(['reference', 'custom']).nullable().optional(),
      url: optionalText,
      reference: z
        .discriminatedUnion('relationTo', [
          z.object({
            relationTo: z.literal('pages'),
            value: documentRelationshipSchema,
          }),
          z.object({
            relationTo: z.literal('posts'),
            value: documentRelationshipSchema,
          }),
        ])
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
})
export const redirectsSchema = z.object({ redirects: z.array(redirectSchema) })
export type ApiRichText = z.infer<typeof richTextSchema>
export type ApiRichTextNode = z.infer<typeof richTextNodeSchema>
export type ApiLink = z.infer<typeof linkSchema>
export type ApiPageBlock = z.infer<typeof pageBlockSchema>
export type ApiAuthor = z.infer<typeof authorSchema>
export type ApiHeaderNavigation = z.infer<typeof headerNavigationSchema>
export type ApiFooterNavigation = z.infer<typeof footerNavigationSchema>
export type ApiRedirect = z.infer<typeof redirectSchema>
export type ApiSectionAppearance = z.infer<typeof sectionAppearanceSchema>

export type ApiError = z.infer<typeof apiErrorSchema>
export type ApiMedia = z.infer<typeof mediaSchema>
export type ApiPage = z.infer<typeof pageSchema>
export type ApiPost = z.infer<typeof postSchema>
export type ApiTaxonomy = z.infer<typeof taxonomySchema>
