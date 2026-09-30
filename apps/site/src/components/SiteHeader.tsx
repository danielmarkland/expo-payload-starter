import Link from 'next/link'

import type { SiteConfig } from '@danielmarkland/contracts'
import { SiteBrand } from '@/components/SiteBrand'
import { ContentLink } from '@/components/LinkAction'
import { ThemeToggle } from '@/components/ThemeToggle'
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
    <header className={`site-header${navigation.sticky ? ' site-header-sticky' : ''}`}>
      <SiteBrand siteConfig={siteConfig} />
      <nav aria-label="Main navigation" className="header-navigation">
        {navigation.items?.map((item) => {
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
        {search.show ? (
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
        ) : null}
      </nav>
      {siteConfig.theme.allowToggle ? (
        <ThemeToggle defaultMode={siteConfig.theme.defaultMode} />
      ) : null}
    </header>
  )
}
