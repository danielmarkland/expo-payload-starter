import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { footerTextContent } from '@danielmarkland/publishing-core/footerMigration'
import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { SiteConfigProvider } from '@/components/SiteConfigProvider'

const payload = vi.hoisted(() => ({
  find: vi.fn(),
  findGlobal: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload: vi.fn(async () => payload) }))
vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('next/script', () => ({ default: () => null }))

import { SiteFooter } from '@/components/SiteFooter'

const siteConfig = {
  integrations: { googleTagManagerId: null, turnstileSiteKey: null },
  identity: {
    appTitle: 'Example App',
    darkLogoUrl: null,
    description: 'A useful site description.',
    faviconUrl: null,
    lightLogoUrl: null,
    logoUrl: null,
    shortName: 'Example',
    siteTitle: 'Example Site',
  },
  theme: {
    allowToggle: true,
    dark: {},
    defaultMode: 'system',
    densityPreset: 'comfortable',
    fontPreset: 'poppins',
    light: {},
    shapePreset: 'soft',
  },
  version: 1,
} as SiteConfig

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('SiteFooter', () => {
  it('renders configured components and queries only the requested latest posts', async () => {
    payload.findGlobal.mockResolvedValue({
      showSearch: true,
      contentAreas: [
        {
          columns: [
            {
              blocks: [
                {
                  blockType: 'text',
                  content: footerTextContent('Trading strategies, built in public.'),
                },
                {
                  blockType: 'links',
                  items: [
                    {
                      icon: 'info',
                      id: 'privacy',
                      label: 'Privacy',
                      newTab: true,
                      type: 'url',
                      url: '/privacy',
                    },
                  ],
                },
                {
                  blockType: 'socialLinks',
                  items: [
                    {
                      icon: 'youtube',
                      id: 'youtube',
                      label: 'YouTube',
                      newTab: true,
                      url: 'https://youtube.com/example',
                    },
                    { icon: 'twitter', id: 'unsafe', label: 'Unsafe', url: 'javascript:alert(1)' },
                  ],
                },
                { blockType: 'copyright', owner: 'Example, LLC' },
              ],
            },
            { blocks: [{ blockType: 'latestPosts', heading: 'Research & Analysis', limit: 2 }] },
          ],
        },
      ],
    })
    payload.find.mockResolvedValue({
      hasNextPage: false,
      hasPrevPage: false,
      limit: 2,
      nextPage: null,
      page: 1,
      prevPage: null,
      totalDocs: 2,
      totalPages: 1,
      docs: [
        {
          id: 2,
          body: footerTextContent(''),
          publishedAt: '2026-06-30T12:00:00.000Z',
          slug: 'risk',
          summary: '',
          title: 'What Risk Means',
        },
        {
          id: 1,
          body: footerTextContent(''),
          publishedAt: '2026-06-16T12:00:00.000Z',
          slug: 'backtesting',
          summary: '',
          title: 'Backtesting',
        },
      ],
    })
    render(await SiteFooter({ siteConfig }))
    expect(screen.getByText('Trading strategies, built in public.')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Social media' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'YouTube' }).getAttribute('href')).toBe(
      'https://youtube.com/example',
    )
    expect(screen.queryByRole('link', { name: 'Unsafe' })).toBeNull()
    const privacy = screen.getByRole('link', { name: /Privacy/ })
    expect(privacy.getAttribute('target')).toBe('_blank')
    expect(privacy.querySelector('.link-icon')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Research & Analysis' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'What Risk Means' }).getAttribute('href')).toBe(
      '/posts/risk',
    )
    expect(screen.getAllByText(/Example, LLC/)).toHaveLength(1)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 2, sort: '-publishedAt' }),
    )
  })
  it('uses branding and copyright defaults without inventing optional content', async () => {
    payload.findGlobal.mockResolvedValue({
      showSearch: true,
      contentAreas: [
        { columns: [{ blocks: [{ blockType: 'logo' }, { blockType: 'copyright' }] }] },
      ],
    })
    render(await SiteFooter({ siteConfig }))
    expect(screen.getAllByText(/Example Site/).length).toBeGreaterThan(0)
    expect(screen.queryByText('A useful site description.')).toBeNull()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(payload.find).not.toHaveBeenCalled()
  })
  it('renders contact and newsletter components in authored column order', async () => {
    payload.findGlobal.mockResolvedValue({
      showSearch: true,
      contentAreas: [
        {
          columns: [
            {
              blocks: [
                {
                  blockType: 'contactForm',
                  heading: 'Start a conversation',
                  submitLabel: 'Send',
                  successMessage: 'Sent.',
                },
              ],
            },
            {
              blocks: [
                {
                  blockType: 'newsletter',
                  heading: 'Join the newsletter',
                  submitLabel: 'Join',
                  successMessage: 'Joined.',
                  consentText: 'Consent copy',
                },
              ],
            },
          ],
        },
      ],
    })
    const { container } = render(
      <SiteConfigProvider config={siteConfig}>
        {await SiteFooter({ siteConfig })}
      </SiteConfigProvider>,
    )
    const headings = container.querySelectorAll('.footer-content-heading')
    expect([...headings].map((h) => h.textContent)).toEqual([
      'Start a conversation',
      'Join the newsletter',
    ])
    expect(container.querySelectorAll('.footer-content-column')).toHaveLength(2)
  })
})
