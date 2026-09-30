import {
  authorSchema,
  navigationSchema,
  paginatedPostsSchema,
  redirectsSchema,
  searchResultsSchema,
  sitemapEntriesSchema,
  taxonomySchema,
} from '@danielmarkland/contracts'
import { internalApiRequest } from '@/lib/api/internal'
import type {
  Author,
  Category,
  FooterNavigation,
  HeaderNavigation,
  Post,
  Redirect,
  Tag,
} from '@/payload-types'

export async function getNavigationDocuments() {
  const response = await internalApiRequest('/navigation')
  if (!response.ok) throw new Error(`Navigation API request failed (${response.status}).`)
  const navigation = navigationSchema.parse(await response.json())
  return {
    footer: navigation.footer as unknown as FooterNavigation,
    header: navigation.header as unknown as HeaderNavigation,
  }
}

export async function getPublishedPosts(query = '') {
  const response = await internalApiRequest(`/posts${query}`)
  if (!response.ok) throw new Error(`Posts API request failed (${response.status}).`)
  const result = paginatedPostsSchema.parse(await response.json())
  return { ...result, docs: result.docs as unknown as Post[] }
}

export async function getTaxonomyDocument(
  collection: 'authors' | 'categories' | 'tags',
  slug: string,
) {
  const response = await internalApiRequest(`/${collection}/${encodeURIComponent(slug)}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Taxonomy API request failed (${response.status}).`)
  const value =
    collection === 'authors'
      ? authorSchema.parse(await response.json())
      : taxonomySchema.parse(await response.json())
  return value as unknown as Author | Category | Tag
}

export async function getSearchResults(query: string) {
  const response = await internalApiRequest(`/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error(`Search API request failed (${response.status}).`)
  return searchResultsSchema.parse(await response.json()).results
}

export async function getSitemapDocuments() {
  const response = await internalApiRequest('/sitemap')
  if (!response.ok) throw new Error(`Sitemap API request failed (${response.status}).`)
  return sitemapEntriesSchema.parse(await response.json()).entries
}

export async function getRedirectDocuments() {
  const response = await internalApiRequest('/redirects')
  if (!response.ok) throw new Error(`Redirect API request failed (${response.status}).`)
  return redirectsSchema.parse(await response.json()).redirects as unknown as Redirect[]
}
