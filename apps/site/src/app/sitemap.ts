import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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

  return [
    { url: siteURL, lastModified: new Date() },
    { url: `${siteURL}/posts`, lastModified: new Date() },
    ...pages.docs
      .filter((page) => page.slug !== 'home')
      .map((page) => ({
        url: `${siteURL}/${encodeURIComponent(page.slug)}`,
        lastModified: page.updatedAt,
      })),
    ...posts.docs.map((post) => ({
      url: `${siteURL}/posts/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt,
    })),
  ]
}
