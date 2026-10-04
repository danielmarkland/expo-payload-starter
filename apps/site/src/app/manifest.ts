import type { MetadataRoute } from 'next'

import appIcon from '@starter/brand/assets/icon.png'
import { getSitePresentation } from '@/lib/getSiteSettings'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { config: siteConfig, metadata } = await getSitePresentation()

  return {
    background_color: siteConfig.theme.dark.surface,
    description: siteConfig.identity.description,
    display: 'standalone',
    icons: [
      {
        purpose: 'any',
        sizes: 'any',
        src: metadata.faviconUrl || appIcon.src,
      },
    ],
    name: siteConfig.identity.siteTitle,
    short_name: siteConfig.identity.shortName,
    start_url: '/',
    theme_color: siteConfig.theme.dark.surface,
  }
}
