import Link from 'next/link'
import { getPayload } from 'payload'

import { brand } from '@starter/design-tokens'
import { getNavigationHref } from '@/lib/navigation'
import config from '@/payload.config'

export async function SiteFooter() {
  const appURL = process.env.NEXT_PUBLIC_APP_URL
  const payload = await getPayload({ config })
  const navigation = await payload.findGlobal({ slug: 'footerNavigation', depth: 1 })

  return (
    <footer className="site-footer">
      <Link className="site-brand" href="/">
        {brand.siteTitle}
      </Link>
      {appURL ? (
        <a className="footer-app-link" href={appURL}>
          Open app
        </a>
      ) : null}
      {navigation.items?.length ? (
        <nav aria-label="Footer navigation" className="footer-navigation">
          {navigation.items.map((item) => {
            const href = getNavigationHref(item)
            if (!href) return null
            return (
              <Link href={href} key={item.id || item.label}>
                {item.label}
              </Link>
            )
          })}
        </nav>
      ) : null}
      <small>
        © {new Date().getFullYear()} {brand.siteTitle}
      </small>
    </footer>
  )
}
