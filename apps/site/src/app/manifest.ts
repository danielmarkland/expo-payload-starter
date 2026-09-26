import type { MetadataRoute } from 'next'

import { brand, themes } from '@starter/design-tokens'
import appIcon from '@starter/design-tokens/assets/icon.png'

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: themes.dark.surface,
    description: brand.description,
    display: 'standalone',
    icons: [
      {
        purpose: 'any',
        sizes: '1024x1024',
        src: appIcon.src,
        type: 'image/png',
      },
    ],
    name: brand.siteTitle,
    short_name: brand.shortName,
    start_url: '/',
    theme_color: themes.dark.surface,
  }
}
