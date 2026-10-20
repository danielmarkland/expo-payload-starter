import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type {
  ComponentType,
  ComponentProps,
  CSSProperties,
  SVGProps,
} from 'react'
import type {
  ApiFooterNavigation,
  FooterContentBlock,
  PostCard,
  SiteConfig,
} from '@danielmarkland/publishing-contracts'
import type { createContactForm } from './ContactForm.js'
import type { createNewsletterForm } from './NewsletterForm.js'
import type { createLinkComponents } from './LinkAction.js'
import { SiteBrand } from './SiteBrand.js'
import {
  getNavigationHref,
  getSafeExternalHref,
} from '@danielmarkland/publishing-core/navigation'
import { sectionAppearanceClassName } from '@danielmarkland/publishing-core/sectionAppearance'
import { resolveSectionWidth } from '@danielmarkland/publishing-core/sectionWidth'
import { buttonClassName } from '@danielmarkland/publishing-core/buttonVariants'

export function createSiteFooter({
  ContactForm,
  NewsletterForm,
  ContentLink,
  getHeaderNavigationIcon,
}: {
  ContactForm: ComponentType<
    ComponentProps<ReturnType<typeof createContactForm>>
  >
  NewsletterForm: ComponentType<
    ComponentProps<ReturnType<typeof createNewsletterForm>>
  >
  ContentLink: ReturnType<typeof createLinkComponents>['ContentLink']
  getHeaderNavigationIcon: (
    icon?: string | null,
  ) => ComponentType<SVGProps<SVGSVGElement>> | undefined
}) {
  return function SiteFooter({
    siteConfig,
    navigation,
    posts,
  }: {
    siteConfig: SiteConfig
    navigation: ApiFooterNavigation
    posts: { docs: PostCard[] }
  }) {
    function renderBlock(block: FooterContentBlock, mode?: 'dark' | 'light') {
      const heading = block.heading ? (
        <h2 className="footer-content-heading">{block.heading}</h2>
      ) : null
      switch (block.blockType) {
        case 'logo':
          return <SiteBrand siteConfig={siteConfig} mode={mode} />
        case 'text':
          return (
            <>
              {heading}
              {block.content ? (
                <div className="footer-content-text">
                  <RichText data={block.content} />
                </div>
              ) : null}
            </>
          )
        case 'links':
          return (
            <>
              {heading}
              <nav
                aria-label={block.heading || 'Footer links'}
                className="footer-content-links"
              >
                {block.items
                  ?.filter((item) => getNavigationHref(item))
                  .map((item) => (
                    <ContentLink key={item.id || item.label} link={item} />
                  ))}
              </nav>
            </>
          )
        case 'socialLinks':
          return (
            <>
              {heading}
              <nav
                aria-label={block.heading || 'Social media'}
                className="footer-social-navigation"
              >
                {block.items?.map((item) => {
                  const href = getSafeExternalHref(item.url)
                  const Icon = getHeaderNavigationIcon(item.icon)
                  return href ? (
                    <a
                      href={href}
                      aria-label={item.label}
                      key={item.id || item.url}
                      target={item.newTab ? '_blank' : undefined}
                      rel={item.newTab ? 'noreferrer' : undefined}
                      className="footer-social-link"
                    >
                      {Icon ? <Icon aria-hidden="true" /> : item.label}
                    </a>
                  ) : null
                })}
              </nav>
            </>
          )
        case 'copyright':
          return (
            <small>
              © {new Date().getFullYear()}{' '}
              {block.owner || siteConfig.identity.siteTitle}
            </small>
          )
        case 'callToAction':
          return (
            <>
              {heading}
              {block.body ? <p>{block.body}</p> : null}
              {block.action && getNavigationHref(block.action) ? (
                <ContentLink
                  link={block.action}
                  className={buttonClassName(
                    block.action.variant,
                    'primary-filled',
                  )}
                />
              ) : null}
            </>
          )
        case 'latestPosts':
          return posts.docs.length ? (
            <section aria-label={block.heading || 'Latest posts'}>
              {heading || (
                <h2 className="footer-content-heading">Latest posts</h2>
              )}
              <div className="site-footer-post-list">
                {posts.docs.slice(0, block.limit ?? 2).map((post) => (
                  <article key={post.id}>
                    <h3>
                      <Link href={`/posts/${encodeURIComponent(post.slug)}`}>
                        {post.title}
                      </Link>
                    </h3>
                    {post.publishedAt ? (
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString(
                          undefined,
                          { day: 'numeric', month: 'long', year: 'numeric' },
                        )}
                      </time>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null
        case 'newsletter':
          return (
            <>
              {block.eyebrow ? (
                <p className="eyebrow">{block.eyebrow}</p>
              ) : null}
              {heading}
              {block.body ? <p>{block.body}</p> : null}
              <NewsletterForm
                destinationId={block.destinationId}
                buttonVariant={block.submitButtonVariant}
                consentText={block.consentText}
                submitLabel={block.submitLabel}
                submitIcon={block.icon}
                submitIconPosition={block.iconPosition}
                successMessage={block.successMessage}
              />
            </>
          )
        case 'contactForm':
          return (
            <>
              {block.eyebrow ? (
                <p className="eyebrow">{block.eyebrow}</p>
              ) : null}
              {heading}
              {block.body ? <p>{block.body}</p> : null}
              <ContactForm
                nameMode={block.nameMode}
                showCompany={block.showCompany}
                submitButtonVariant={block.submitButtonVariant}
                submitLabel={block.submitLabel}
                submitIcon={block.icon}
                submitIconPosition={block.iconPosition}
                successMessage={block.successMessage}
              />
            </>
          )
      }
    }
    return (
      <footer
        className={`site-footer footer-builder footer-background-${navigation.background === 'dark' ? 'dark' : 'page'}`}
      >
        {navigation.contentAreas?.map((area, index) => {
          if (
            !area.columns.some((column) =>
              column.blocks?.some((block) => block.enabled !== false),
            )
          )
            return null
          const background = area.appearance?.background
          const dark =
            background === 'dark' ||
            ((!background || background === 'default') &&
              navigation.background === 'dark')
          return (
            <section
              key={area.id || index}
              aria-label={area.title || `Footer area ${index + 1}`}
              className={sectionAppearanceClassName(['footer-content-area'], {
                ...area.appearance,
                paddingTop: area.appearance?.paddingTop || 'md',
                paddingBottom: area.appearance?.paddingBottom || 'md',
                width: resolveSectionWidth({
                  site: siteConfig.width,
                  block: area.appearance?.width,
                }),
              })}
            >
              <div
                className="footer-content-columns"
                style={
                  {
                    '--footer-column-count': area.columns.length,
                  } as CSSProperties
                }
              >
                {area.columns.map((column, ci) => (
                  <div
                    key={column.id || ci}
                    className={`footer-content-column footer-content-align-${column.alignment || 'start'}`}
                  >
                    {column.blocks
                      ?.filter((block) => block.enabled !== false)
                      .map((block, bi) => (
                        <div
                          key={block.id || bi}
                          className={sectionAppearanceClassName(
                            ['footer-content-block'],
                            block.appearance,
                          )}
                        >
                          {renderBlock(
                            block,
                            dark
                              ? 'dark'
                              : background === 'light'
                                ? 'light'
                                : undefined,
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </footer>
    )
  }
}
