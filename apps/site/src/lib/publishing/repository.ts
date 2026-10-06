import type { PublishingPostsQuery } from '@danielmarkland/publishing-contracts/publishingApi'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { orderSelectedPosts } from '@danielmarkland/publishing-core/postSelection'
import {
  resolvePublishingSearchResults,
  publishedDocumentConditions,
  publishedPostConditions,
  siteMetadata,
  sitemapEntries,
} from '@danielmarkland/publishing-core/publishingRules'
import { resolveSiteConfig } from '@/lib/siteConfig'
export async function findPage(slug: string, draft = false) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    draft,
    limit: 1,
    overrideAccess: draft,
    where: {
      and: [...publishedDocumentConditions(slug, draft)],
    },
  })
  return result.docs[0] ?? null
}

export async function findPost(slug: string, draft = false) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    where: {
      and: [...publishedDocumentConditions(slug, draft)],
    },
  })
  return result.docs[0] ?? null
}

export async function findPosts({
  ids,
  authorId,
  categoryId,
  limit = 12,
  page = 1,
  search,
  tagId,
}: Partial<PublishingPostsQuery>) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: ids ? ids.length : limit,
    page: ids ? 1 : page,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      and: [...publishedPostConditions({ ids, authorId, categoryId, search, tagId })],
    },
  })
  return ids ? { ...result, docs: orderSelectedPosts(result.docs, ids) } : result
}

export async function searchContent(query: string) {
  const payload = await getPayload({ config })
  const searchResults = await payload.find({
    collection: 'search',
    depth: 0,
    limit: 20,
    overrideAccess: false,
    sort: '-priority',
    where: { or: [{ title: { like: query } }, { searchText: { like: query } }] },
  })
  return resolvePublishingSearchResults(searchResults.docs, async (collection, id) =>
    payload.findByID({ collection, id, overrideAccess: false }).catch(() => null),
  )
}

export async function getSitemapEntries() {
  const payload = await getPayload({ config })
  const [pages, posts] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      where: { _status: { equals: 'published' } },
    }),
  ])
  return sitemapEntries(pages.docs, posts.docs)
}

export async function getRedirectDocuments() {
  const payload = await getPayload({ config })
  const redirects = await payload.find({
    collection: 'redirects',
    depth: 1,
    limit: 1000,
    overrideAccess: true,
  })
  return { redirects: redirects.docs }
}

export async function findTaxonomy(collection: 'authors' | 'categories' | 'tags', slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection,
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ?? null
}

export async function getNavigation() {
  const payload = await getPayload({ config })
  const [header, footer] = await Promise.all([
    payload.findGlobal({ slug: 'headerNavigation', depth: 1 }),
    payload.findGlobal({ slug: 'footerNavigation', depth: 1 }),
  ])
  return { footer, header }
}

export async function getResolvedSiteConfig() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 1 })
  return resolveSiteConfig(settings)
}

export async function getSiteMetadata() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 1 })
  const resolved = resolveSiteConfig(settings)
  return siteMetadata(settings, resolved)
}
