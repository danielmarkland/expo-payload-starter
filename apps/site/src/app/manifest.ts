import type { MetadataRoute } from 'next'

import appIcon from '@starter/design-tokens/assets/icon.png'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { resolveSiteConfig } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings()
  const siteConfig = resolveSiteConfig(settings)
  const favicon = settings.favicon
  const faviconURL = favicon && typeof favicon === 'object' ? favicon.url : null

  return {
    background_color: siteConfig.theme.dark.surface,
    description: siteConfig.identity.description,
    display: 'standalone',
    icons: [
      {
        purpose: 'any',
        sizes: 'any',
        src: faviconURL || appIcon.src,
      },
    ],
    name: siteConfig.identity.siteTitle,
    short_name: siteConfig.identity.shortName,
    start_url: '/',
    theme_color: siteConfig.theme.dark.surface,
  }
}
