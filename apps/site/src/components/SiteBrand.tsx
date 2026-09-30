import Image from 'next/image'
import Link from 'next/link'

import type { SiteConfig } from '@danielmarkland/contracts'

export function SiteBrand({ siteConfig }: { siteConfig: SiteConfig }) {
  return (
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
  )
}
