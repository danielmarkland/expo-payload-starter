import Link from 'next/link'
import { getPayload } from 'payload'

import { brand } from '@starter/design-tokens'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getNavigationHref } from '@/lib/navigation'
import config from '@/payload.config'

export async function SiteHeader() {
  const payload = await getPayload({ config })
  const navigation = await payload.findGlobal({ slug: 'headerNavigation', depth: 1 })

  return (
    <header className="site-header">
      <Link className="site-brand" href="/">
        {brand.siteTitle}
      </Link>
      <nav aria-label="Main navigation" className="header-navigation">
        {navigation.items?.map((item) => {
          const href = getNavigationHref(item)
          if (!href) return null
          const external = item.type === 'url' && !href.startsWith('/')
          return (
            <Link
              href={href}
              key={item.id || item.label}
              rel={item.newTab ? 'noreferrer' : undefined}
              target={item.newTab ? '_blank' : undefined}
            >
              {item.label}
              {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </Link>
          )
        })}
        <Link href="/search">Search</Link>
      </nav>
      <ThemeToggle />
    </header>
  )
}
