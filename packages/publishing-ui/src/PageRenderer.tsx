import Image from 'next/image'
import {
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import type { ComponentType, ComponentProps } from 'react'
import type { createContactForm } from './ContactForm.js'
import type { LatestPostsSection as SharedLatestPostsSection } from './LatestPostsSection.js'
import type { createLinkComponents } from './LinkAction.js'
import { getNavigationHref } from '@danielmarkland/publishing-core/navigation'
import { sectionAppearanceClassName } from '@danielmarkland/publishing-core/sectionAppearance'
import type {
  ApiMedia as Media,
  ApiPage as Page,
  ApiPageBlock as PageBlock,
} from '@danielmarkland/publishing-contracts'

export function createPageRenderer({
  ContactForm,
  LatestPostsSection,
  ActionLink,
  ContentLink,
}: {
  ContactForm: ComponentType<
    ComponentProps<ReturnType<typeof createContactForm>>
  >
  LatestPostsSection: ComponentType<
    Omit<ComponentProps<typeof SharedLatestPostsSection>, 'posts'> & {
      limit?: number | null
    }
  >
  ActionLink: ReturnType<typeof createLinkComponents>['ActionLink']
  ContentLink: ReturnType<typeof createLinkComponents>['ContentLink']
}) {
  type HeroBlock = Extract<PageBlock, { blockType: 'hero' }>

  function blockClassName(block: PageBlock): string {
    return sectionAppearanceClassName(
      ['page-block', `page-block-${block.blockType}`],
      block.appearance,
    )
  }

  function resolveMedia(
    media: number | string | Media | null | undefined,
  ): Media | null {
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

  function SectionAction({
    action,
  }: {
    action?: Parameters<typeof ActionLink>[0]['action']
  }) {
    return (
      <ActionLink
        action={action}
        className="section-action"
        fallbackVariant="primary-outline"
      />
    )
  }

  function HeroHeadline({
    data,
    primary,
  }: {
    data: HeroBlock['heading']
    primary: boolean
  }) {
    const Heading = primary ? 'h1' : 'h2'
    const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
      ...defaultConverters,
      paragraph: ({ node, nodesToJSX }) => (
        <Heading className="page-hero-heading">
          {nodesToJSX({ nodes: node.children })}
        </Heading>
      ),
      text: ({ node }) => {
        const content = node.text
        const properties = node.$
        const tone =
          properties && typeof properties === 'object' && 'tone' in properties
            ? properties.tone
            : undefined
        return tone === 'accent' ? (
          <span className="hero-heading-accent">{content}</span>
        ) : (
          content
        )
      },
    })

    return <RichText converters={converters} data={data} />
  }

  function PageBlockView({
    block,
    primaryHero,
  }: {
    block: PageBlock
    primaryHero: boolean
  }) {
    switch (block.blockType) {
      case 'hero': {
        const image = resolveMedia(block.image)
        const headingHref = block.primaryButton
          ? getNavigationHref(block.primaryButton)
          : null
        const secondaryHref = block.secondaryButton
          ? getNavigationHref(block.secondaryButton)
          : null
        return (
          <section
            className={`page-hero hero-variant-${block.variant || 'split'} hero-alignment-${block.alignment || 'left'} hero-height-${block.height || 'standard'}${!image?.url || block.variant === 'text' || block.variant === 'background' ? ' page-hero-without-image' : ''}`}
            style={
              block.variant === 'background' && image?.url
                ? {
                    backgroundImage: `linear-gradient(rgb(0 0 0 / ${(block.overlay ?? 50) / 100}), rgb(0 0 0 / ${(block.overlay ?? 50) / 100})), url(${JSON.stringify(image.url)})`,
                    backgroundPosition: `${block.focalX ?? 50}% ${block.focalY ?? 50}%`,
                  }
                : undefined
            }
          >
            <div className="page-hero-copy">
              {block.eyebrow ? (
                <p className="eyebrow">{block.eyebrow}</p>
              ) : null}
              <HeroHeadline data={block.heading} primary={primaryHero} />
              {block.secondaryHeading ? (
                <p className="page-hero-secondary-heading">
                  {block.secondaryHeading}
                </p>
              ) : null}
              {block.body ? <p className="lede">{block.body}</p> : null}
              {headingHref || secondaryHref ? (
                <div className="actions">
                  {headingHref ? (
                    <ActionLink action={block.primaryButton} />
                  ) : null}
                  {secondaryHref ? (
                    <ActionLink
                      action={block.secondaryButton}
                      fallbackVariant="secondary-outline"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
            {image?.url &&
            block.variant !== 'background' &&
            block.variant !== 'text' ? (
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
            <SectionHeading
              eyebrow={block.eyebrow}
              heading={block.heading}
              intro={block.intro}
            />
            <div
              className={`feature-grid feature-grid-${block.layout || 'cards'} feature-treatment-${block.cardTreatment || 'separated'}${
                block.layout === 'stacked' ? '' : ' page-card-grid'
              }`}
            >
              {block.items?.map((item, index) => (
                <article
                  className={
                    block.layout === 'stacked'
                      ? 'feature-stacked-item'
                      : block.layout === 'process'
                        ? 'feature-process-item'
                        : block.layout === 'plain'
                          ? 'feature-plain-item'
                          : 'page-card'
                  }
                  key={item.id || item.title}
                  style={
                    item.ruleColor
                      ? { borderTop: `2px solid ${item.ruleColor}` }
                      : undefined
                  }
                >
                  {block.numbered || block.layout === 'process' ? (
                    <span className="feature-step-number">
                      {block.layout === 'process' ? 'Step ' : ''}
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ) : null}
                  <h3>{item.title}</h3>
                  {item.metadata ? (
                    <p className="feature-metadata">{item.metadata}</p>
                  ) : null}
                  {item.body ? (
                    <div className="article-body feature-body">
                      <RichText data={item.body} />
                    </div>
                  ) : (
                    <p>{item.description}</p>
                  )}
                </article>
              ))}
            </div>
            <SectionAction action={block.action} />
          </section>
        )
      case 'splitContent': {
        const image = resolveMedia(block.image)
        return (
          <section
            className={`page-section split-content split-content-${block.imagePosition}`}
          >
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
            <SectionHeading
              eyebrow={block.eyebrow}
              heading={block.heading}
              intro={block.intro}
            />
            <ul className="link-grid">
              {block.items?.map((item) => {
                const href = getNavigationHref(item)
                return (
                  <li key={item.id || item.label}>
                    {href ? (
                      <ContentLink link={item} />
                    ) : (
                      <span>{item.label}</span>
                    )}
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
            <SectionHeading
              eyebrow={block.eyebrow}
              heading={block.heading}
              intro={block.intro}
            />
            <div className="portfolio-grid">
              {block.items?.map((item) => {
                const href = getNavigationHref(item)
                const content = (
                  <>
                    <h3>{item.name}</h3>
                    {item.role ? (
                      <p className="portfolio-role">{item.role}</p>
                    ) : null}
                    {item.metadata ? (
                      <p className="feature-metadata">{item.metadata}</p>
                    ) : null}
                    {item.body ? (
                      <div className="article-body feature-body">
                        <RichText data={item.body} />
                      </div>
                    ) : (
                      <p>{item.description}</p>
                    )}
                  </>
                )
                return (
                  <article
                    className="portfolio-card"
                    key={item.id || item.name}
                  >
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
          <section
            className={`page-cta${block.variant === 'band' ? ' page-cta-band' : ''}${block.buttonSurface === 'light' ? ' cta-button-light' : ''}`}
          >
            {block.variant === 'band' ? (
              <div className="page-cta-inner">
                <div>
                  {block.eyebrow ? (
                    <p className="eyebrow">{block.eyebrow}</p>
                  ) : null}
                  <h2>{block.heading}</h2>
                  {block.body ? <p>{block.body}</p> : null}
                </div>
                {buttonHref ? <ActionLink action={block.action} /> : null}
              </div>
            ) : (
              <>
                <div>
                  {block.eyebrow ? (
                    <p className="eyebrow">{block.eyebrow}</p>
                  ) : null}
                  <h2>{block.heading}</h2>
                  {block.body ? <p>{block.body}</p> : null}
                </div>
                {buttonHref ? <ActionLink action={block.action} /> : null}
              </>
            )}
          </section>
        )
      }
      case 'testimonials':
        return (
          <section className="page-section">
            <SectionHeading eyebrow={block.eyebrow} heading={block.heading} />
            <div className="page-card-grid">
              {block.items?.map((item) => (
                <figure
                  className="page-card testimonial"
                  key={item.id || item.name}
                >
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
            <SectionHeading
              eyebrow={block.eyebrow}
              heading={block.heading}
              intro={block.intro}
            />
            <ul
              className="logo-cloud"
              aria-label={block.heading || 'Organizations'}
            >
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
                    {href ? (
                      <ContentLink link={item}>{logo}</ContentLink>
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
          <section className="page-section contact-section">
            <SectionHeading
              eyebrow={block.eyebrow}
              heading={block.heading}
              intro={block.body}
            />
            <ContactForm
              nameMode={block.nameMode}
              showCompany={block.showCompany}
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
            {block.items?.map((item) =>
              block.variant === 'rows' ? (
                <article className="faq-row" key={item.id || item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ) : (
                <details className="faq-item" key={item.id || item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ),
            )}
          </section>
        )
      case 'latestPosts':
        return (
          <LatestPostsSection
            {...block}
            actionElement={<SectionAction action={block.action} />}
          />
        )
      default:
        return null
    }
  }

  function PageRenderer({ page }: { page: Page }) {
    const firstHero = page.layout.find((block) => block.blockType === 'hero')

    return (
      <main
        className="page-shell"
        data-page={page.slug}
        data-header-variant={page.headerVariant || 'inherit'}
      >
        {page.customCSS ? (
          <style dangerouslySetInnerHTML={{ __html: page.customCSS }} />
        ) : null}
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

  return PageRenderer
}
