import Link from 'next/link'

import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { SiteHeader as SharedSiteHeader } from './SiteHeader.js'
import { createLinkComponents } from './LinkAction.js'
import { getSafeExternalHref } from '@danielmarkland/publishing-core/navigation'
import { getHeaderNavigationIcon } from './headerNavigationIcons.js'
import { getNavigationHref } from '@danielmarkland/publishing-core/navigation'
import {
  getHeaderNavigationPresentation,
  getSearchNavigationPresentation,
} from './headerNavigationIcons.js'
import type { ApiHeaderNavigation } from '@danielmarkland/publishing-contracts'
import { getLinkIcon } from './linkIcons.js'
const { ContentLink } = createLinkComponents(getLinkIcon)

export function ConfiguredSiteHeader({
  siteConfig,
  navigation,
  themeStorageKey,
}: {
  siteConfig: SiteConfig
  navigation: ApiHeaderNavigation
  themeStorageKey: string
}) {
  const search = getSearchNavigationPresentation(navigation)
  const SearchIcon = search.Icon

  return (
    <SharedSiteHeader
      siteConfig={siteConfig}
      variant={navigation.variant}
      helpLink={
        navigation.helpLink ? <ContentLink link={navigation.helpLink} /> : null
      }
      socialLinks={navigation.socialLinks?.map((item) => {
        const href = getSafeExternalHref(item.url)
        const Icon = getHeaderNavigationIcon(item.icon)
        return href && Icon ? (
          <a
            className="header-social-link"
            key={item.id || item.url}
            href={href}
            aria-label={item.label}
            target={item.newTab ? '_blank' : undefined}
            rel={item.newTab ? 'noreferrer' : undefined}
          >
            <Icon aria-hidden="true" />
          </a>
        ) : null
      })}
      sticky={navigation.sticky}
      themeStorageKey={themeStorageKey}
      navigation={navigation.items?.map((item) => {
        const href = getNavigationHref(item)
        if (!href) return null
        const { iconOnly } = getHeaderNavigationPresentation(item)
        return href ? (
          <ContentLink
            className={
              [
                iconOnly ? 'header-navigation-icon-only' : '',
                item.treatment === 'accent' ? 'header-navigation-accent' : '',
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
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
              <SearchIcon
                aria-hidden="true"
                className="header-navigation-icon"
              />
            ) : (
              'Search'
            )}
          </Link>
        ) : null
      }
    />
  )
}
