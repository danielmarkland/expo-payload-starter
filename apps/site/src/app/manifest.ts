import { siteManifest } from '@danielmarkland/publishing-core/publishingRules'
import type { MetadataRoute } from 'next'

import appIcon from '@starter/brand/assets/icon.png'
import { getSitePresentation } from '@/lib/getSiteSettings'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { config: siteConfig, metadata } = await getSitePresentation()

  return siteManifest(siteConfig, metadata, appIcon.src)
}
