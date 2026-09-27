import type { MetadataRoute } from 'next'

import { brand, themes } from '@starter/design-tokens'
import appIcon from '@starter/design-tokens/assets/icon.png'
import { getSiteSettings } from '@/lib/getSiteSettings'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings()
  const favicon = settings.favicon
  const faviconURL = favicon && typeof favicon === 'object' ? favicon.url : null

  return {
    background_color: themes.dark.surface,
    description: brand.description,
    display: 'standalone',
    icons: [
      {
        purpose: 'any',
        sizes: 'any',
        src: faviconURL || appIcon.src,
      },
    ],
    name: brand.siteTitle,
    short_name: brand.shortName,
    start_url: '/',
    theme_color: themes.dark.surface,
  }
}
