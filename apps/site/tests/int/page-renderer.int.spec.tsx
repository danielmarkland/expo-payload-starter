import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { PageRenderer } from '@/components/PageRenderer'
import { createHeroHeadline } from '@/lib/heroHeadline'
import type { Media, Page } from '@/payload-types'

vi.mock('@/components/LatestPostsSection', () => ({
  LatestPostsSection: ({ heading }: { heading?: string | null }) => <section>{heading}</section>,
}))
vi.mock('@/components/ContactForm', () => ({
  ContactForm: ({ submitLabel }: { submitLabel: string }) => <form>{submitLabel}</form>,
}))

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

  return renderToStaticMarkup(<PageRenderer page={page} />)
}

describe('Payload page renderer', () => {
  it('renders the marketing blocks with one primary heading and safe links', () => {
    const markup = renderPage([
      {
        id: 'hero-one',
        blockType: 'hero',
        eyebrow: 'First section',
        heading: createHeroHeadline('A CMS-authored homepage', ['CMS-authored']),
        secondaryHeading: 'A flexible supporting headline',
        body: 'Page introduction',
        primaryButton: { label: 'Get in touch', url: '/contact' },
        secondaryButton: { label: 'Unsafe link', url: 'javascript:alert(1)' },
      },
      { id: 'hero-two', blockType: 'hero', heading: createHeroHeadline('A second hero') },
      {
        id: 'rich-text',
        blockType: 'richText',
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
        image: media,
        caption: 'Image caption',
      },
      {
        id: 'features',
        blockType: 'featureGrid',
        heading: 'What we do',
        layout: 'stacked',
        items: [{ id: 'feature-one', title: 'Strategy', description: 'Plan the work.' }],
        action: { label: 'Explore services', url: '#about' },
      },
      {
        id: 'split-content',
        blockType: 'splitContent',
        anchor: 'about',
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
        heading: 'Expertise',
        items: [
          { id: 'typescript', label: 'TypeScript', url: 'https://www.typescriptlang.org' },
          { id: 'unsafe', label: 'Unsafe expertise', url: 'javascript:alert(1)' },
        ],
      },
      {
        id: 'portfolio',
        blockType: 'portfolioGrid',
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
        heading: 'Start a conversation',
        buttonLabel: 'Email us',
        buttonUrl: 'mailto:hello@example.com',
      },
      {
        id: 'testimonials',
        blockType: 'testimonials',
        items: [{ id: 'quote-one', quote: 'A helpful quote.', name: 'A Person', role: 'Founder' }],
      },
      {
        id: 'logos',
        blockType: 'logoCloud',
        items: [{ id: 'logo-one', name: 'Example Co', image: media, url: 'https://example.com' }],
      },
      {
        id: 'contact',
        blockType: 'contactForm',
        anchor: 'contact',
        heading: 'Get in touch',
        submitLabel: 'Send message',
        successMessage: 'Message sent.',
      },
      {
        id: 'stats',
        blockType: 'stats',
        items: [{ id: 'stat-one', value: '3×', label: 'Growth' }],
      },
      {
        id: 'faq',
        blockType: 'faq',
        items: [{ id: 'question-one', question: 'How does it work?', answer: 'Step by step.' }],
      },
      { id: 'latest-posts', blockType: 'latestPosts', heading: 'Recent writing', limit: 3 },
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
    expect(markup).toContain('Biography content')
    expect(markup).toContain('TypeScript')
    expect(markup).toContain('Example Client')
    expect(markup).toContain('mailto:hello@example.com')
    expect(markup).toContain('A helpful quote.')
    expect(markup).toContain('Example Co')
    expect(markup).toContain('3×')
    expect(markup).toContain('How does it work?')
    expect(markup).toContain('Recent writing')
    expect(markup).toContain('Send message')
    expect(markup).not.toContain('Unsafe link')
    expect(markup).not.toContain('javascript:alert(1)')
  })

  it('uses the page title as the primary heading when there is no hero block', () => {
    const markup = renderPage([
      { id: 'features', blockType: 'featureGrid', heading: 'Page content', items: [] },
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
            paddingBottom: 'xl',
            marginTop: 'md',
            marginBottom: 'none',
            contentWidth: 'text',
            background: 'raised',
            borderTop: 'accent',
            borderBottom: 'default',
            rounded: true,
          },
        },
      ],
      '[data-page="test-page"] h2 { letter-spacing: 0; }',
    )

    expect(markup).toContain('data-page="test-page"')
    expect(markup).toContain(
      'page-block page-block-featureGrid padding-top-sm padding-bottom-xl margin-top-md margin-bottom-none content-width-text background-raised border-top-accent border-bottom-default page-block-rounded',
    )
    expect(markup).toContain('data-block-type="featureGrid"')
    expect(markup).toContain('[data-page="test-page"] h2 { letter-spacing: 0; }')
  })
})
