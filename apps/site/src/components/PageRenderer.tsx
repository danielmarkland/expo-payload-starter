import Image from 'next/image'
import Link from 'next/link'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { ContactForm } from '@/components/ContactForm'
import { LatestPostsSection } from '@/components/LatestPostsSection'
import type { Media, Page } from '@/payload-types'

type PageBlock = Page['layout'][number]
type HeroBlock = Extract<PageBlock, { blockType: 'hero' }>

function blockClassName(block: PageBlock): string {
  const appearance = block.appearance
  const classes = ['page-block', `page-block-${block.blockType}`]

  if (appearance?.paddingTop) classes.push(`padding-top-${appearance.paddingTop}`)
  if (appearance?.paddingBottom) classes.push(`padding-bottom-${appearance.paddingBottom}`)
  if (appearance?.marginTop) classes.push(`margin-top-${appearance.marginTop}`)
  if (appearance?.marginBottom) classes.push(`margin-bottom-${appearance.marginBottom}`)
  if (appearance?.contentWidth) classes.push(`content-width-${appearance.contentWidth}`)
  if (appearance?.background) classes.push(`background-${appearance.background}`)
  if (appearance?.borderTop) classes.push(`border-top-${appearance.borderTop}`)
  if (appearance?.borderBottom) classes.push(`border-bottom-${appearance.borderBottom}`)
  if (appearance?.rounded) classes.push('page-block-rounded')

  return classes.join(' ')
}

function resolveMedia(media: number | Media | null | undefined): Media | null {
  return media && typeof media === 'object' ? media : null
}

function safeHref(value?: string | null): string | null {
  if (!value) return null
  if (/^#[a-z][a-z0-9-]*$/.test(value)) return value
  if (value.startsWith('/') && !value.startsWith('//')) return value

  try {
    const protocol = new URL(value).protocol
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol) ? value : null
  } catch {
    return null
  }
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
      const headingHref = safeHref(block.primaryButton?.url)
      const secondaryHref = safeHref(block.secondaryButton?.url)
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
                {block.primaryButton?.label && headingHref ? (
                  <Link className="primary" href={headingHref}>
                    {block.primaryButton.label}
                  </Link>
                ) : null}
                {block.secondaryButton?.label && secondaryHref ? (
                  <Link className="secondary" href={secondaryHref}>
                    {block.secondaryButton.label}
                  </Link>
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
          {block.heading ? <h2>{block.heading}</h2> : null}
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
          <div className="page-card-grid">
            {block.items?.map((item) => (
              <article className="page-card" key={item.id || item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      )
    case 'splitContent': {
      const image = resolveMedia(block.image)
      return (
        <section
          className={`page-section split-content split-content-${block.imagePosition}`}
          id={block.anchor || undefined}
        >
          <div className="split-content-copy">
            <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
            <div className="article-body">
              <RichText data={block.content} />
            </div>
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
        <section className="page-section" id={block.anchor || undefined}>
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <ul className="link-grid">
            {block.items?.map((item) => {
              const href = safeHref(item.url)
              return (
                <li key={item.id || item.label}>
                  {href ? (
                    <Link href={href} rel="noreferrer" target="_blank">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )
    case 'portfolioGrid':
      return (
        <section className="page-section" id={block.anchor || undefined}>
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} />
          <div className="portfolio-grid">
            {block.items?.map((item) => {
              const href = safeHref(item.url)
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
                    <Link href={href} rel="noreferrer" target="_blank">
                      {content}
                    </Link>
                  ) : (
                    <div className="portfolio-content">{content}</div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )
    case 'callToAction': {
      const buttonHref = safeHref(block.buttonUrl)
      return (
        <section className="page-cta">
          <div>
            <h2>{block.heading}</h2>
            {block.body ? <p>{block.body}</p> : null}
          </div>
          {buttonHref ? (
            <Link className="primary" href={buttonHref}>
              {block.buttonLabel}
            </Link>
          ) : null}
        </section>
      )
    }
    case 'testimonials':
      return (
        <section className="page-section">
          <SectionHeading heading={block.heading} />
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
        <section className="page-section" id={block.anchor || undefined}>
          <SectionHeading heading={block.heading} intro={block.intro} />
          <ul className="logo-cloud" aria-label={block.heading || 'Organizations'}>
            {block.items?.map((item) => {
              const image = resolveMedia(item.image)
              const href = safeHref(item.url)
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
                  {href ? (
                    <Link href={href} rel="noreferrer" target="_blank">
                      {logo}
                    </Link>
                  ) : (
                    logo
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )
    case 'contactForm':
      return (
        <section className="page-section contact-section" id={block.anchor || undefined}>
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading} intro={block.body} />
          <ContactForm submitLabel={block.submitLabel} successMessage={block.successMessage} />
        </section>
      )
    case 'stats':
      return (
        <section className="page-section">
          <SectionHeading heading={block.heading} />
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
          <SectionHeading heading={block.heading} />
          {block.items?.map((item) => (
            <details className="faq-item" key={item.id || item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      )
    case 'latestPosts':
      return <LatestPostsSection heading={block.heading} limit={block.limit} />
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
          key={block.id || block.blockType}
        >
          <PageBlockView block={block} primaryHero={block === firstHero} />
        </div>
      ))}
    </main>
  )
}
