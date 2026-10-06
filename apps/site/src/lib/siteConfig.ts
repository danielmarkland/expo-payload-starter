import { resolvePublishingSiteConfig } from '@danielmarkland/publishing-core/siteConfig'
export { siteConfigCSS } from '@danielmarkland/publishing-core/siteConfig'
import type { SiteSetting } from '@/payload-types'
import { getSiteURL } from '@/lib/serverConfig'
import { brand } from '@starter/brand'

export function resolveSiteConfig(settings: SiteSetting, siteURL = getSiteURL()) {
  return resolvePublishingSiteConfig(
    {
      ...settings,
      appTitle: settings.appTitle || brand.appTitle,
      siteTitle: settings.siteTitle || brand.siteTitle,
      shortName: settings.shortName || brand.shortName,
      siteDescription: settings.siteDescription || brand.description,
    },
    siteURL,
  )
}
