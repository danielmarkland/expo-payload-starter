import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import Image from 'next/image'

export type LandingPageContent = {
  body: string | null
  eyebrow: string | null
  heading: string | null
  showLogo: boolean
  surface: string
}

export function LandingPage({
  content,
  siteConfig,
}: {
  content: LandingPageContent
  siteConfig: SiteConfig
}) {
  if (content.showLogo) {
    const dark =
      siteConfig.identity.darkLogoUrl || siteConfig.identity.lightLogoUrl
    const light =
      siteConfig.identity.lightLogoUrl || siteConfig.identity.darkLogoUrl
    return (
      <main
        className="landing-page landing-page-logo-only"
        data-surface={content.surface}
        aria-label={siteConfig.identity.siteTitle}
      >
        <div className="landing-page-logo">
          {dark ? (
            <Image
              alt={siteConfig.identity.siteTitle}
              className="site-brand-logo site-brand-logo-dark"
              src={dark}
              width={360}
              height={96}
              unoptimized
              priority
            />
          ) : null}
          {light ? (
            <Image
              alt={siteConfig.identity.siteTitle}
              className="site-brand-logo site-brand-logo-light"
              src={light}
              width={360}
              height={96}
              unoptimized
              priority
            />
          ) : null}
        </div>
      </main>
    )
  }
  return (
    <main className="landing-page" data-surface={content.surface}>
      <section className="landing-page-content">
        {content.eyebrow ? <p className="eyebrow">{content.eyebrow}</p> : null}
        {content.heading ? <h1>{content.heading}</h1> : null}
        {content.body ? (
          <p className="lede landing-page-body">{content.body}</p>
        ) : null}
      </section>
    </main>
  )
}
