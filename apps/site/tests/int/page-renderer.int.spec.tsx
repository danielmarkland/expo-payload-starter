import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { PageRenderer } from '@/components/PageRenderer'
import type { Media, Page } from '@/payload-types'

vi.mock('@/components/LatestPostsSection', () => ({
  LatestPostsSection: ({ heading }: { heading?: string | null }) => <section>{heading}</section>,
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

function renderPage(layout: Page['layout']) {
  const page: Page = {
    id: 1,
    title: 'Page title',
    slug: 'test-page',
    layout,
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
        heading: 'A CMS-authored homepage',
        body: 'Page introduction',
        primaryButton: { label: 'Get in touch', url: '/contact' },
        secondaryButton: { label: 'Unsafe link', url: 'javascript:alert(1)' },
      },
      { id: 'hero-two', blockType: 'hero', heading: 'A second hero' },
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
        items: [{ id: 'feature-one', title: 'Strategy', description: 'Plan the work.' }],
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
        items: [{ id: 'logo-one', name: 'Example Co', image: media }],
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
    expect(markup).toContain('<h1>A CMS-authored homepage</h1>')
    expect(markup).toContain('<h2>A second hero</h2>')
    expect(markup).toContain('Rich text content')
    expect(markup).toContain('Example media')
    expect(markup).toContain('Strategy')
    expect(markup).toContain('mailto:hello@example.com')
    expect(markup).toContain('A helpful quote.')
    expect(markup).toContain('Example Co')
    expect(markup).toContain('3×')
    expect(markup).toContain('How does it work?')
    expect(markup).toContain('Recent writing')
    expect(markup).not.toContain('Unsafe link')
  })

  it('uses the page title as the primary heading when there is no hero block', () => {
    const markup = renderPage([
      { id: 'features', blockType: 'featureGrid', heading: 'Page content', items: [] },
    ])

    expect(markup).toContain('<h1>Page title</h1>')
    expect(markup).toContain('<h2>Page content</h2>')
  })
})
