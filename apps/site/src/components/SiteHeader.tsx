import Link from 'next/link'

import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { SiteHeader as SharedSiteHeader } from '@danielmarkland/publishing-ui/SiteHeader'
import { THEME_STORAGE_KEY } from '@/theme'
import { ContentLink } from '@/components/LinkAction'
import { getNavigationHref } from '@/lib/navigation'
import {
  getHeaderNavigationPresentation,
  getSearchNavigationPresentation,
} from '@/lib/headerNavigationIcons'
import { getNavigationDocuments } from '@/lib/api/content'

export async function SiteHeader({ siteConfig }: { siteConfig: SiteConfig }) {
  const { header: navigation } = await getNavigationDocuments()
  const search = getSearchNavigationPresentation(navigation)
  const SearchIcon = search.Icon

  return (
    <SharedSiteHeader
      siteConfig={siteConfig}
      sticky={navigation.sticky}
      themeStorageKey={THEME_STORAGE_KEY}
      navigation={navigation.items?.map((item) => {
        const href = getNavigationHref(item)
        if (!href) return null
        const { iconOnly } = getHeaderNavigationPresentation(item)
        return href ? (
          <ContentLink
            className={iconOnly ? 'header-navigation-icon-only' : undefined}
            key={item.id || item.label}
            link={item}
          />
        ) : null
      })}
      search={
        search.show ? (
          <Link
            aria-label={SearchIcon ? 'Search' : undefined}
            className={SearchIcon ? 'header-navigation-icon-only' : undefined}
            href="/search"
          >
            {SearchIcon ? (
              <SearchIcon aria-hidden="true" className="header-navigation-icon" />
            ) : (
              'Search'
            )}
          </Link>
        ) : null
      }
    />
  )
}
