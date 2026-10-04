import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { createPublishingBlocks } from '@danielmarkland/publishing-core/payloadBlocks'
import { createPublishingFields } from '@danielmarkland/publishing-core/payloadFields'
import { createPageRenderer } from './PageRenderer.js'
import { ArrowRight } from 'lucide-react'
import { createLinkComponents } from './LinkAction.js'
import { createHeroHeadline } from '@danielmarkland/publishing-core'
import {
  pageSchema,
  type ApiPage as Page,
  type ApiMedia as Media,
} from '@danielmarkland/publishing-contracts'

const { ActionLink, ContentLink } = createLinkComponents((icon) =>
  icon === 'arrow-right' ? ArrowRight : undefined,
)
const PageRenderer = createPageRenderer({
  ActionLink,
  ContentLink,
  LatestPostsSection: ({ eyebrow, heading }) => (
    <section>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {heading}
    </section>
  ),
  ContactForm: ({ submitButtonVariant, submitLabel }) => (
    <form data-submit-button-variant={submitButtonVariant}>{submitLabel}</form>
  ),
})
const { pageBlocks } = createPublishingBlocks(
  createPublishingFields({
    linkIconOptions: [],
    socialIconOptions: [],
    iconPickerFieldComponent: {},
    linkRowLabel: '/label',
  }),
)

const media: Media = {
  id: 1,
  alt: 'Example media',
  url: '/example.jpg',
  width: 800,
  height: 600,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderPage(layout: Page['layout'], customCSS?: string) {
  const page: Page = {
    id: 1,
    title: 'Page title',
    slug: 'test-page',
    layout,
    customCSS,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  return renderToStaticMarkup(<PageRenderer page={pageSchema.parse(page)} />)
}

function sectionMeta(name: string) {
  return { anchor: `section-${name}`, eyebrow: `${name} eyebrow` }
}

describe('Payload page renderer', () => {
  it('provides anchor and eyebrow fields for every page block', () => {
    for (const block of pageBlocks) {
      const fieldNames = block.fields.flatMap((field) =>
        'name' in field ? [field.name] : [],
      )
      expect(fieldNames, block.slug).toContain('anchor')
      expect(fieldNames, block.slug).toContain('eyebrow')
      const anchor = block.fields.find(
        (field) => 'name' in field && field.name === 'anchor',
      )
      const eyebrow = block.fields.find(
        (field) => 'name' in field && field.name === 'eyebrow',
      )
      expect(
        anchor && 'required' in anchor ? anchor.required : undefined,
        block.slug,
      ).not.toBe(true)
      expect(
        eyebrow && 'required' in eyebrow ? eyebrow.required : undefined,
        block.slug,
      ).not.toBe(true)
    }
  })

  it('renders the marketing blocks with one primary heading and safe links', () => {
    const markup = renderPage([
      {
        id: 'hero-one',
        blockType: 'hero',
        ...sectionMeta('hero-one'),
        heading: createHeroHeadline('A CMS-authored homepage', [
          'CMS-authored',
        ]),
        secondaryHeading: 'A flexible supporting headline',
        body: 'Page introduction',
        primaryButton: {
          label: 'Get in touch',
          url: '/contact',
          variant: 'secondary-filled',
        },
        secondaryButton: { label: 'Unsafe link', url: 'javascript:alert(1)' },
      },
      {
        id: 'hero-two',
        blockType: 'hero',
        ...sectionMeta('hero-two'),
        heading: createHeroHeadline('A second hero'),
      },
      {
        id: 'rich-text',
        blockType: 'richText',
        ...sectionMeta('rich-text'),
        heading: 'About the work',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Rich text content',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      {
        id: 'image',
        blockType: 'image',
        ...sectionMeta('image'),
        image: media,
        caption: 'Image caption',
      },
      {
        id: 'features',
        blockType: 'featureGrid',
        ...sectionMeta('features'),
        heading: 'What we do',
        layout: 'stacked',
        items: [
          {
            id: 'feature-one',
            title: 'Strategy',
            description: 'Plan the work.',
          },
        ],
        action: {
          icon: 'arrow-right',
          iconPosition: 'right',
          label: 'Explore services',
          type: 'url',
          url: '#about',
          variant: 'primary-outline',
        },
      },
      {
        id: 'split-content',
        blockType: 'splitContent',
        ...sectionMeta('split-content'),
        heading: 'About',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Biography content',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        image: media,
        imagePosition: 'right',
      },
      {
        id: 'expertise',
        blockType: 'linkGrid',
        ...sectionMeta('expertise'),
        heading: 'Expertise',
        items: [
          {
            id: 'typescript',
            label: 'TypeScript',
            type: 'url',
            url: 'https://www.typescriptlang.org',
          },
          {
            id: 'unsafe',
            label: 'Unsafe expertise',
            type: 'url',
            url: 'javascript:alert(1)',
          },
        ],
      },
      {
        id: 'portfolio',
        blockType: 'portfolioGrid',
        ...sectionMeta('portfolio'),
        heading: 'Career highlights',
        items: [
          {
            id: 'example-client',
            name: 'Example Client',
            role: 'React // TypeScript',
            description: 'Delivered a successful project.',
            url: 'https://example.com',
          },
        ],
      },
      {
        id: 'cta',
        blockType: 'callToAction',
        ...sectionMeta('cta'),
        heading: 'Start a conversation',
        action: {
          label: 'Email us',
          type: 'url',
          url: 'mailto:hello@example.com',
          variant: 'secondary-outline',
        },
      },
      {
        id: 'testimonials',
        blockType: 'testimonials',
        ...sectionMeta('testimonials'),
        items: [
          {
            id: 'quote-one',
            quote: 'A helpful quote.',
            name: 'A Person',
            role: 'Founder',
          },
        ],
      },
      {
        id: 'logos',
        blockType: 'logoCloud',
        ...sectionMeta('logos'),
        items: [
          {
            id: 'logo-one',
            name: 'Example Co',
            image: media,
            url: 'https://example.com',
          },
        ],
      },
      {
        id: 'contact',
        blockType: 'contactForm',
        ...sectionMeta('contact'),
        heading: 'Get in touch',
        submitButtonVariant: 'secondary-outline',
        submitLabel: 'Send message',
        successMessage: 'Message sent.',
      },
      {
        id: 'stats',
        blockType: 'stats',
        ...sectionMeta('stats'),
        items: [{ id: 'stat-one', value: '3×', label: 'Growth' }],
      },
      {
        id: 'faq',
        blockType: 'faq',
        ...sectionMeta('faq'),
        items: [
          {
            id: 'question-one',
            question: 'How does it work?',
            answer: 'Step by step.',
          },
        ],
      },
      {
        id: 'latest-posts',
        blockType: 'latestPosts',
        ...sectionMeta('latest-posts'),
        heading: 'Recent writing',
        limit: 3,
      },
    ])

    expect(markup.match(/<h1/g)).toHaveLength(1)
    expect(markup).toContain(
      '<h1 class="page-hero-heading">A <span class="hero-heading-accent">CMS-authored</span> homepage</h1>',
    )
    expect(markup).toContain('<h2 class="page-hero-heading">A second hero</h2>')
    expect(markup).toContain('A flexible supporting headline')
    expect(markup).toContain('Rich text content')
    expect(markup).toContain('Example media')
    expect(markup).toContain('Strategy')
    expect(markup).toContain('feature-grid-stacked')
    expect(markup).toContain('Explore services')
    expect(markup).toContain('button button-primary-outline section-action')
    expect(markup).toContain('lucide-arrow-right')
    expect(markup).toContain('Biography content')
    expect(markup).toContain('TypeScript')
    expect(markup).toContain('Example Client')
    expect(markup).toContain('mailto:hello@example.com')
    expect(markup).toContain('button button-secondary-filled')
    expect(markup).toContain('button button-secondary-outline')
    expect(markup).toContain('A helpful quote.')
    expect(markup).toContain('Example Co')
    expect(markup).toContain('3×')
    expect(markup).toContain('How does it work?')
    expect(markup).toContain('Recent writing')
    expect(markup).toContain('Send message')
    expect(markup).toContain('data-submit-button-variant="secondary-outline"')
    expect(markup.match(/id="section-/g)).toHaveLength(15)
    for (const name of [
      'hero-one',
      'hero-two',
      'rich-text',
      'image',
      'features',
      'split-content',
      'expertise',
      'portfolio',
      'cta',
      'testimonials',
      'logos',
      'contact',
      'stats',
      'faq',
      'latest-posts',
    ]) {
      expect(markup).toContain(`<p class="eyebrow">${name} eyebrow</p>`)
      expect(markup).toContain(`id="section-${name}"`)
    }
    expect(markup.indexOf('<p class="eyebrow">image eyebrow</p>')).toBeLessThan(
      markup.indexOf('<img'),
    )
    expect(markup).not.toContain('Unsafe link')
    expect(markup).not.toContain('javascript:alert(1)')
  })

  it('uses the page title as the primary heading when there is no hero block', () => {
    const markup = renderPage([
      {
        id: 'features',
        blockType: 'featureGrid',
        heading: 'Page content',
        items: [],
      },
    ])

    expect(markup).toContain('<h1>Page title</h1>')
    expect(markup).toContain('<h2>Page content</h2>')
  })

  it('renders design-system appearance controls and advanced page CSS', () => {
    const markup = renderPage(
      [
        {
          id: 'styled-features',
          blockType: 'featureGrid',
          heading: 'Styled content',
          items: [],
          appearance: {
            paddingTop: 'sm',
            paddingRight: 'md',
            paddingBottom: 'xl',
            paddingLeft: 'none',
            marginTop: 'md',
            marginRight: 'sm',
            marginBottom: 'none',
            marginLeft: 'lg',
            contentWidth: 'text',
            background: 'raised',
            borderTop: 'accent',
            borderRight: 'default',
            borderBottom: 'default',
            borderLeft: 'accent',
            borderWidth: 'thick',
            rounded: true,
          },
        },
      ],
      '[data-page="test-page"] h2 { letter-spacing: 0; }',
    )

    expect(markup).toContain('data-page="test-page"')
    expect(markup).toContain(
      'page-block page-block-featureGrid padding-top-sm padding-right-md padding-bottom-xl padding-left-none margin-top-md margin-right-sm margin-bottom-none margin-left-lg content-width-text background-raised border-top-accent border-right-default border-bottom-default border-left-accent border-width-thick page-block-rounded',
    )
    expect(markup).toContain('data-block-type="featureGrid"')
    expect(markup).toContain(
      '[data-page="test-page"] h2 { letter-spacing: 0; }',
    )
  })
})
