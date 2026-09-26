import Link from 'next/link'

import { brand } from '@starter/design-tokens'
import { ThemeToggle } from '@/components/ThemeToggle'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-brand" href="/">
        {brand.siteTitle}
      </Link>
      <ThemeToggle />
    </header>
  )
}
