import { sitemapURLs } from '@danielmarkland/publishing-core/publishingRules'
import type { MetadataRoute } from 'next'
import { getSitemapDocuments } from '@/lib/api/content'
import { getSiteURL } from '@/lib/serverConfig'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteURL = getSiteURL()
  const entries = await getSitemapDocuments()

  return sitemapURLs(siteURL, entries)
}
