import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { ConfiguredSiteHeader } from '@danielmarkland/publishing-ui/ConfiguredSiteHeader'
import { THEME_STORAGE_KEY } from '@/theme'
import { getNavigationDocuments } from '@/lib/api/content'
export async function SiteHeader({ siteConfig }: { siteConfig: SiteConfig }) {
  const { header } = await getNavigationDocuments()
  return (
    <ConfiguredSiteHeader
      siteConfig={siteConfig}
      navigation={header}
      themeStorageKey={THEME_STORAGE_KEY}
    />
  )
}
