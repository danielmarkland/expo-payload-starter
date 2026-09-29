import type { MetadataRoute } from 'next'

import { getSiteURL } from '@/lib/serverConfig'

export default function robots(): MetadataRoute.Robots {
  const siteURL = getSiteURL()
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/search'] }],
    sitemap: `${siteURL}/sitemap.xml`,
  }
}
