import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'

import { brand } from '@starter/design-tokens'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getNavigationHref } from '@/lib/navigation'
import { getHeaderNavigationPresentation } from '@/lib/headerNavigationIcons'
import config from '@/payload.config'

export async function SiteHeader() {
  const payload = await getPayload({ config })
  const navigation = await payload.findGlobal({ slug: 'headerNavigation', depth: 1 })
  const logo = typeof navigation.logo === 'object' && navigation.logo ? navigation.logo : null

  return (
    <header className="site-header">
      <ThemeToggle />
      <Link aria-label={brand.siteTitle} className="site-brand" href="/">
        {logo?.url ? (
          <Image
            alt=""
            className="site-brand-logo"
            height={logo.height || 48}
            src={logo.url}
            unoptimized
            width={logo.width || 180}
          />
        ) : (
          brand.siteTitle
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
        <Link href="/search">Search</Link>
      </nav>
    </header>
  )
}
