import Image from 'next/image'
import Link from 'next/link'

import type { SiteConfig } from '@danielmarkland/publishing-contracts'

export function SiteBrand({
  siteConfig,
  mode,
}: {
  mode?: 'dark' | 'light'
  siteConfig: {
    identity: Pick<
      SiteConfig['identity'],
      'siteTitle' | 'darkLogoUrl' | 'lightLogoUrl'
    > &
      Pick<SiteConfig['identity'], 'logoMaxWidth' | 'logoMaxHeight'>
  }
}) {
  return (
    <Link
      aria-label={siteConfig.identity.siteTitle}
      className={`site-brand${mode ? ` site-brand-on-${mode}` : ''}`}
      style={
        {
          '--site-logo-max-width': `${siteConfig.identity.logoMaxWidth ?? 240}px`,
          '--site-logo-max-height': `${siteConfig.identity.logoMaxHeight ?? 56}px`,
        } as import('react').CSSProperties
      }
      href="/"
    >
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
