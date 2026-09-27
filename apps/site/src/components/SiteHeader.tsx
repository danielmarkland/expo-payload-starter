import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'

import type { SiteConfig } from '@starter/contracts'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getNavigationHref } from '@/lib/navigation'
import {
  getHeaderNavigationPresentation,
  getSearchNavigationPresentation,
} from '@/lib/headerNavigationIcons'
import config from '@/payload.config'

export async function SiteHeader({ siteConfig }: { siteConfig: SiteConfig }) {
  const payload = await getPayload({ config })
  const navigation = await payload.findGlobal({ slug: 'headerNavigation', depth: 1 })
  const search = getSearchNavigationPresentation(navigation)
  const SearchIcon = search.Icon

  return (
    <header className={`site-header${navigation.sticky ? ' site-header-sticky' : ''}`}>
      <Link aria-label={siteConfig.identity.siteTitle} className="site-brand" href="/">
        {siteConfig.identity.darkLogoUrl ? (
          <Image
            alt=""
            className="site-brand-logo site-brand-logo-dark"
            height={48}
            src={siteConfig.identity.darkLogoUrl}
            unoptimized
            width={180}
          />
        ) : (
          <span className="site-brand-title site-brand-title-dark">
            {siteConfig.identity.siteTitle}
          </span>
        )}
        {siteConfig.identity.lightLogoUrl ? (
          <Image
            alt=""
            className="site-brand-logo site-brand-logo-light"
            height={48}
            src={siteConfig.identity.lightLogoUrl}
            unoptimized
            width={180}
          />
        ) : (
          <span className="site-brand-title site-brand-title-light">
            {siteConfig.identity.siteTitle}
          </span>
        )}
      </Link>
      <nav aria-label="Main navigation" className="header-navigation">
        {navigation.items?.map((item) => {
          const href = getNavigationHref(item)
          if (!href) return null
          const external = item.type === 'url' && !href.startsWith('/')
          const { Icon, iconOnly } = getHeaderNavigationPresentation(item)
          return (
            <Link
              aria-label={iconOnly ? item.label : undefined}
              className={iconOnly ? 'header-navigation-icon-only' : undefined}
              href={href}
              key={item.id || item.label}
              rel={item.newTab ? 'noreferrer' : undefined}
              target={item.newTab ? '_blank' : undefined}
            >
              {Icon ? <Icon aria-hidden="true" className="header-navigation-icon" /> : null}
              {!iconOnly ? item.label : null}
              {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </Link>
          )
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
