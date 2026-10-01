import Image from 'next/image'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { ContactForm } from '@/components/ContactForm'
import { LatestPostsSection } from '@/components/LatestPostsSection'
import { ActionLink, ContentLink } from '@/components/LinkAction'
import { getNavigationHref } from '@/lib/navigation'
import { sectionAppearanceClassName } from '@danielmarkland/publishing-core'
import type { Media, Page } from '@/payload-types'

type PageBlock = Page['layout'][number]
type HeroBlock = Extract<PageBlock, { blockType: 'hero' }>

function blockClassName(block: PageBlock): string {
  return sectionAppearanceClassName(
    ['page-block', `page-block-${block.blockType}`],
    block.appearance,
  )
}

function resolveMedia(media: number | Media | null | undefined): Media | null {
  return media && typeof media === 'object' ? media : null
}

function SectionHeading({
  eyebrow,
  heading,
  intro,
}: {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
}) {
  if (!eyebrow && !heading && !intro) return null

  return (
    <header className="section-heading">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {heading ? <h2>{heading}</h2> : null}
      {intro ? <p className="lede">{intro}</p> : null}
    </header>
  )
}

function SectionAction({ action }: { action?: Parameters<typeof ActionLink>[0]['action'] }) {
  return <ActionLink action={action} className="section-action" fallbackVariant="primary-outline" />
}

function HeroHeadline({ data, primary }: { data: HeroBlock['heading']; primary: boolean }) {
  const Heading = primary ? 'h1' : 'h2'
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    paragraph: ({ node, nodesToJSX }) => (
      <Heading className="page-hero-heading">{nodesToJSX({ nodes: node.children })}</Heading>
    ),
    text: ({ node }) => {
      const content = node.text
      const tone = (node as typeof node & { $?: { tone?: unknown } }).$?.tone
      return tone === 'accent' ? <span className="hero-heading-accent">{content}</span> : content
    },
  })

  return <RichText converters={converters} data={data} />
}

function PageBlockView({ block, primaryHero }: { block: PageBlock; primaryHero: boolean }) {
  switch (block.blockType) {
    case 'hero': {
      const image = resolveMedia(block.image)
      const headingHref = block.primaryButton ? getNavigationHref(block.primaryButton) : null
      const secondaryHref = block.secondaryButton ? getNavigationHref(block.secondaryButton) : null
      return (
        <section className={`page-hero${image?.url ? '' : ' page-hero-without-image'}`}>
          <div className="page-hero-copy">
            {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
            <HeroHeadline data={block.heading} primary={primaryHero} />
            {block.secondaryHeading ? (
              <p className="page-hero-secondary-heading">{block.secondaryHeading}</p>
            ) : null}
            {block.body ? <p className="lede">{block.body}</p> : null}
            {headingHref || secondaryHref ? (
              <div className="actions">
                {headingHref ? <ActionLink action={block.primaryButton} /> : null}
                {secondaryHref ? (
                  <ActionLink action={block.secondaryButton} fallbackVariant="secondary-outline" />
                ) : null}
              </div>
            ) : null}
          </div>
          {image?.url ? (
            <Image
              alt={image.alt || ''}
              className="page-hero-image"
              height={image.height || 900}
              src={image.url}
              unoptimized
              width={image.width || 1200}
            />
          ) : null}
        </section>
      )
    }
    case 'richText':
      return (
        <section className="page-section prose-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
          <div className="article-body">
            <RichText data={block.content} />
          </div>
        </section>
      )
    case 'image': {
      const image = resolveMedia(block.image)
      if (!image?.url) return null
      return (
        <figure className="page-image">
          {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
          <Image
            alt={image.alt || ''}
            height={image.height || 900}
            src={image.url}
            unoptimized
            width={image.width || 1200}
          />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      )
    }
    case 'featureGrid':
      return (
        <section className="page-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <div
            className={`feature-grid feature-grid-${block.layout || 'cards'}${
              block.layout === 'stacked' ? '' : ' page-card-grid'
            }`}
          >
            {block.items?.map((item) => (
              <article
                className={block.layout === 'stacked' ? 'feature-stacked-item' : 'page-card'}
                key={item.id || item.title}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <SectionAction action={block.action} />
        </section>
      )
    case 'splitContent': {
      const image = resolveMedia(block.image)
      return (
        <section className={`page-section split-content split-content-${block.imagePosition}`}>
          <div className="split-content-copy">
            <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
            <div className="article-body">
              <RichText data={block.content} />
            </div>
            <SectionAction action={block.action} />
          </div>
          {image?.url ? (
            <Image
              alt={image.alt || ''}
              className="split-content-image"
              height={image.height || 900}
              src={image.url}
              unoptimized
              width={image.width || 1200}
            />
          ) : null}
        </section>
      )
    }
    case 'linkGrid':
      return (
        <section className="page-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <ul className="link-grid">
            {block.items?.map((item) => {
              const href = getNavigationHref(item)
              return (
                <li key={item.id || item.label}>
                  {href ? <ContentLink link={item} /> : <span>{item.label}</span>}
                </li>
              )
            })}
          </ul>
          <SectionAction action={block.action} />
        </section>
      )
    case 'portfolioGrid':
      return (
        <section className="page-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <div className="portfolio-grid">
            {block.items?.map((item) => {
              const href = getNavigationHref(item)
              const content = (
                <>
                  <h3>{item.name}</h3>
                  {item.role ? <p className="portfolio-role">{item.role}</p> : null}
                  <p>{item.description}</p>
                </>
              )
              return (
                <article className="portfolio-card" key={item.id || item.name}>
                  {href ? (
                    <ContentLink link={item}>{content}</ContentLink>
                  ) : (
                    <div className="portfolio-content">{content}</div>
                  )}
                </article>
              )
            })}
          </div>
          <SectionAction action={block.action} />
        </section>
      )
    case 'callToAction': {
      const buttonHref = getNavigationHref(block.action)
      return (
        <section className="page-cta">
          <div>
            {block.eyebrow ? <p className="eyebrow">{block.eyebrow}</p> : null}
            <h2>{block.heading}</h2>
            {block.body ? <p>{block.body}</p> : null}
          </div>
          {buttonHref ? <ActionLink action={block.action} /> : null}
        </section>
      )
    }
    case 'testimonials':
      return (
        <section className="page-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
          <div className="page-card-grid">
            {block.items?.map((item) => (
              <figure className="page-card testimonial" key={item.id || item.name}>
                <blockquote>{item.quote}</blockquote>
                <figcaption>
                  <strong>{item.name}</strong>
                  {item.role ? <span>{item.role}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )
    case 'logoCloud':
      return (
        <section className="page-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <ul className="logo-cloud" aria-label={block.heading || 'Organizations'}>
            {block.items?.map((item) => {
              const image = resolveMedia(item.image)
              const href = getNavigationHref(item)
              const logo = image?.url ? (
                <Image
                  alt={item.name}
                  height={image.height || 120}
                  src={image.url}
                  unoptimized
                  width={image.width || 240}
                />
              ) : (
                <span>{item.name}</span>
              )
              return (
                <li key={item.id || item.name}>
                  {href ? <ContentLink link={item}>{logo}</ContentLink> : logo}
                </li>
              )
            })}
          </ul>
        </section>
      )
    case 'contactForm':
      return (
        <section className="page-section contact-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.body} />
          <ContactForm
            submitIcon={block.icon}
            submitIconPosition={block.iconPosition}
            submitButtonVariant={block.submitButtonVariant}
            submitLabel={block.submitLabel}
            successMessage={block.successMessage}
          />
        </section>
      )
    case 'stats':
      return (
        <section className="page-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
          <dl className="stats-grid">
            {block.items?.map((item) => (
              <div className="stat" key={item.id || item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
    case 'faq':
      return (
        <section className="page-section faq-section">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
          {block.items?.map((item) => (
            <details className="faq-item" key={item.id || item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      )
    case 'latestPosts':
      return (
        <LatestPostsSection eyebrow={block.eyebrow} heading={block.heading} limit={block.limit} />
      )
    default:
      return null
  }
}

export function PageRenderer({ page }: { page: Page }) {
  const firstHero = page.layout.find((block) => block.blockType === 'hero')

  return (
    <main className="page-shell" data-page={page.slug}>
      {page.customCSS ? <style dangerouslySetInnerHTML={{ __html: page.customCSS }} /> : null}
      {!firstHero ? (
        <header className="page-title">
          <h1>{page.title}</h1>
        </header>
      ) : null}
      {page.layout.map((block) => (
        <div
          className={blockClassName(block)}
          data-block-type={block.blockType}
          id={block.anchor || undefined}
          key={block.id || block.blockType}
        >
          <PageBlockView block={block} primaryHero={block === firstHero} />
        </div>
      ))}
    </main>
  )
}
