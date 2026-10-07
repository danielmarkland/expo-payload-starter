import type { Field, Where } from 'payload'
import type {
  ApiPage,
  ApiPost,
  SiteConfig,
} from '@danielmarkland/publishing-contracts'
import { extractSearchText } from './extractSearchText.js'
import { publishingDocumentPath } from './preview.js'
export function publishedDocumentConditions(
  slug: string,
  draft = false,
): Where[] {
  return [
    { slug: { equals: slug } },
    ...(draft ? [] : [{ _status: { equals: 'published' } }]),
  ]
}
export function publishedPostConditions({
  ids,
  authorId,
  categoryId,
  search,
  tagId,
}: {
  ids?: number[]
  authorId?: number
  categoryId?: number
  search?: string
  tagId?: number
}): Where[] {
  return [
    ...(ids ? [{ id: { in: ids } }] : []),
    { _status: { equals: 'published' } },
    ...(search
      ? [
          {
            or: [
              { title: { contains: search } },
              { summary: { contains: search } },
            ],
          },
        ]
      : []),
    ...(authorId ? [{ author: { equals: authorId } }] : []),
    ...(categoryId ? [{ categories: { equals: categoryId } }] : []),
    ...(tagId ? [{ tags: { equals: tagId } }] : []),
  ]
}
export function createSearchFields(defaultFields: Field[]): Field[] {
  return [
    ...defaultFields,
    { name: 'excerpt', type: 'textarea' },
    { name: 'searchText', type: 'textarea' },
  ]
}
export function syncSearchDocument<T extends object>({
  collectionSlug,
  originalDoc,
  searchDoc,
}: {
  collectionSlug: string
  originalDoc: Record<string, unknown>
  searchDoc: T
}) {
  return {
    ...searchDoc,
    excerpt:
      collectionSlug === 'posts' && typeof originalDoc.summary === 'string'
        ? originalDoc.summary
        : '',
    searchText: extractSearchText(originalDoc),
  }
}
export function publishingDescription(
  doc: Record<string, unknown> | undefined,
) {
  return typeof doc?.summary === 'string'
    ? doc.summary
    : typeof doc?.siteDescription === 'string'
      ? doc.siteDescription
      : undefined
}
export function documentMetadata(
  document: ApiPage | ApiPost,
  fallbackDescription: string,
) {
  const image =
    document.meta?.image && typeof document.meta.image === 'object'
      ? document.meta.image.url
      : null
  return {
    description:
      document.meta?.description ||
      (typeof document.summary === 'string' ? document.summary : '') ||
      fallbackDescription,
    openGraph: image ? { images: [image] } : undefined,
    title: document.meta?.title || document.title,
  }
}
type MetadataSettings = {
  favicon?: { url?: string | null } | number | string | null
  meta?: {
    description?: string | null
    title?: string | null
    image?: { url?: string | null } | number | string | null
  } | null
}
export function siteMetadata(settings: MetadataSettings, resolved: SiteConfig) {
  const favicon =
    settings.favicon && typeof settings.favicon === 'object'
      ? settings.favicon.url
      : null
  const image =
    settings.meta?.image && typeof settings.meta.image === 'object'
      ? settings.meta.image.url
      : null
  return {
    description: settings.meta?.description || resolved.identity.description,
    faviconUrl: favicon || null,
    socialImageUrl: image || null,
    title: settings.meta?.title || resolved.identity.siteTitle,
  }
}
export function sitemapEntries(
  pages: readonly { slug: string; updatedAt: string }[],
  posts: readonly { slug: string; updatedAt: string }[],
) {
  return {
    entries: [
      ...pages
        .filter((page) => page.slug !== 'home')
        .map((page) => ({
          path: publishingDocumentPath('pages', page.slug),
          updatedAt: page.updatedAt,
        })),
      ...posts.map((post) => ({
        path: publishingDocumentPath('posts', post.slug),
        updatedAt: post.updatedAt,
      })),
    ],
  }
}
export function sitemapURLs(
  siteURL: string,
  entries: readonly { path: string; updatedAt: string }[],
  now = new Date(),
) {
  return [
    { url: siteURL, lastModified: now },
    { url: `${siteURL}/posts`, lastModified: now },
    ...entries.map((entry) => ({
      url: `${siteURL}${entry.path}`,
      lastModified: entry.updatedAt,
    })),
  ]
}

export function createPublishingSearchOptions() {
  return {
    collections: ['pages', 'posts'] as ('pages' | 'posts')[],
    defaultPriorities: { pages: 10, posts: 20 },
    searchOverrides: {
      dbName: 'cms_search',
      access: {
        create: () => false,
        delete: () => false,
        update: () => false,
        read: () => true,
      },
      fields: ({ defaultFields }: { defaultFields: Field[] }) =>
        createSearchFields(defaultFields),
    },
    beforeSync: syncSearchDocument,
  }
}

type SearchRecord = {
  id: number
  excerpt?: string | null
  doc: { relationTo: string; value: unknown }
}
type SearchDocument = {
  slug: string
  title: string
  _status?: string | null
  summary?: string | null
  meta?: { title?: string | null } | null
}
export async function resolvePublishingSearchResults(
  records: readonly SearchRecord[],
  resolveDocument: (
    collection: 'pages' | 'posts',
    id: number,
  ) => Promise<SearchDocument | null>,
) {
  const results: {
    href: string
    id: number
    summary: string
    title: string
  }[] = []
  for (const record of records) {
    const { relationTo, value } = record.doc
    if (
      typeof value !== 'number' ||
      (relationTo !== 'pages' && relationTo !== 'posts')
    )
      continue
    const document = await resolveDocument(relationTo, value)
    if (document?._status !== 'published') continue
    results.push({
      href: publishingDocumentPath(relationTo, document.slug),
      id: record.id,
      summary: record.excerpt || document.summary || '',
      title: document.meta?.title || document.title,
    })
  }
  return { results }
}

export function siteDocumentMetadata(
  config: SiteConfig,
  metadata: {
    title: string
    description: string
    faviconUrl?: string | null
    socialImageUrl?: string | null
  },
  options: {
    siteURL: string
    icon: string
    appleIcon: string
    canonicalURL?: string
  },
) {
  return {
    applicationName: config.identity.siteTitle,
    description: metadata.description,
    icons: {
      apple: options.appleIcon,
      icon: metadata.faviconUrl || options.icon,
    },
    metadataBase: new URL(options.siteURL),
    ...(options.canonicalURL
      ? { alternates: { canonical: options.canonicalURL } }
      : {}),
    openGraph: {
      description: metadata.description,
      images: metadata.socialImageUrl ? [metadata.socialImageUrl] : undefined,
      siteName: config.identity.siteTitle,
    },
    title: {
      default: metadata.title,
      template: `%s · ${config.identity.siteTitle}`,
    },
  }
}
export function siteManifest(
  config: SiteConfig,
  metadata: { faviconUrl?: string | null },
  fallbackIcon: string,
) {
  return {
    background_color: config.theme.dark.surface,
    description: config.identity.description,
    display: 'standalone' as const,
    icons: [
      {
        purpose: 'any' as const,
        sizes: 'any',
        src: metadata.faviconUrl || fallbackIcon,
      },
    ],
    name: config.identity.siteTitle,
    short_name: config.identity.shortName,
    start_url: '/',
    theme_color: config.theme.dark.surface,
  }
}
