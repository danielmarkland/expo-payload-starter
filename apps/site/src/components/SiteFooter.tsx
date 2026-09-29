import Link from 'next/link'
import { getPayload } from 'payload'

import type { SiteConfig } from '@starter/contracts'
import { SiteBrand } from '@/components/SiteBrand'
import { getHeaderNavigationIcon } from '@/lib/headerNavigationIcons'
import { getNavigationHref, getSafeExternalHref } from '@/lib/navigation'
import config from '@/payload.config'

export async function SiteFooter({ siteConfig }: { siteConfig: SiteConfig }) {
  const appURL = siteConfig.links.appUrl
  const payload = await getPayload({ config })
  const navigationPromise = payload.findGlobal({ slug: 'footerNavigation', depth: 1 })
  const postsPromise = payload.find({
    collection: 'posts',
    depth: 0,
    limit: 2,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })
  const [navigation, posts] = await Promise.all([navigationPromise, postsPromise])
  const socialLinks =
    navigation.socialLinks?.flatMap((item) => {
      const href = getSafeExternalHref(item.url)
      const Icon = getHeaderNavigationIcon(item.icon)
      return href && Icon ? [{ ...item, href, Icon }] : []
    }) ?? []
  const legalLinks =
    navigation.items?.flatMap((item) => {
      const href = getNavigationHref(item)
      return href ? [{ ...item, href }] : []
    }) ?? []
  const showPosts = navigation.latestPosts?.show !== false && posts.docs.length > 0

  return (
    <footer className="site-footer">
      <div className={`site-footer-main${showPosts ? '' : ' site-footer-main-single'}`}>
        <div className="site-footer-brand">
          <SiteBrand siteConfig={siteConfig} />
          <p className="site-footer-tagline">
            {navigation.tagline || siteConfig.identity.description}
          </p>
          {appURL ? (
            <a className="footer-app-link" href={appURL}>
              Open app
            </a>
          ) : null}
          {socialLinks.length ? (
            <nav aria-label="Social media" className="footer-social-navigation">
              {socialLinks.map(({ Icon, href, ...item }) => (
                <a
                  aria-label={item.label}
                  className="footer-social-link"
                  href={href}
                  key={item.id || `${item.icon}-${href}`}
                  rel={item.newTab ? 'noreferrer' : undefined}
                  target={item.newTab ? '_blank' : undefined}
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </nav>
          ) : null}
          {legalLinks.length ? (
            <nav aria-label="Legal and utility" className="footer-navigation">
              {legalLinks.map((item) => (
                <Link
                  href={item.href}
                  key={item.id || item.label}
                  rel={item.newTab ? 'noreferrer' : undefined}
                  target={item.newTab ? '_blank' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        {showPosts ? (
          <section aria-labelledby="footer-posts-heading" className="site-footer-posts">
            <h2 id="footer-posts-heading">{navigation.latestPosts?.heading || 'Latest posts'}</h2>
            <div className="site-footer-post-list">
              {posts.docs.map((post) => (
                <article key={post.id}>
                  <h3>
                    <Link href={`/posts/${encodeURIComponent(post.slug)}`}>{post.title}</Link>
                  </h3>
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <small className="site-footer-copyright">
        © {new Date().getFullYear()} {navigation.copyrightOwner || siteConfig.identity.siteTitle}
      </small>
    </footer>
  )
}
