import Link from 'next/link'

import { brand } from '@starter/design-tokens'

export function SiteFooter() {
  const appURL = process.env.NEXT_PUBLIC_APP_URL

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
      <small>
        © {new Date().getFullYear()} {brand.siteTitle}
      </small>
    </footer>
  )
}
