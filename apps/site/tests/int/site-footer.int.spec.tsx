import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
  it('renders configured sections and the newest published posts semantically', async () => {
    payload.findGlobal.mockResolvedValue({
      copyrightOwner: 'Example, LLC',
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
      latestPosts: { heading: 'Research & Analysis', show: true },
      socialLinks: [
        {
          icon: 'youtube',
          id: 'youtube',
          label: 'YouTube',
          newTab: true,
          url: 'https://youtube.com/example',
        },
        { icon: 'twitter', id: 'unsafe', label: 'Unsafe', url: 'javascript:alert(1)' },
      ],
      tagline: 'Trading strategies, built in public.',
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
          body: {},
          id: 2,
          publishedAt: '2026-06-30T12:00:00.000Z',
          slug: 'risk',
          summary: '',
          title: 'What Risk Means',
        },
        {
          body: {},
          id: 1,
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
    expect(screen.queryByRole('link', { name: 'Open app' })).toBeNull()
    expect(screen.getAllByText(/Example, LLC/)).toHaveLength(1)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 2, sort: '-publishedAt' }),
    )
  })

  it('uses site fallbacks and omits empty optional sections', async () => {
    payload.findGlobal.mockResolvedValue({
      items: [],
      latestPosts: { show: false },
      socialLinks: [],
    })
    payload.find.mockResolvedValue({
      docs: [],
      hasNextPage: false,
      hasPrevPage: false,
      limit: 2,
      nextPage: null,
      page: 1,
      prevPage: null,
      totalDocs: 0,
      totalPages: 0,
    })

    render(await SiteFooter({ siteConfig }))

    expect(screen.getByText('A useful site description.')).toBeTruthy()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(screen.getAllByText(/Example Site/).length).toBeGreaterThan(0)
  })

  it('renders enabled global newsletter and contact sections in fixed order', async () => {
    payload.findGlobal.mockResolvedValue({
      contactForm: {
        heading: 'Start a conversation',
        show: true,
        submitLabel: 'Send',
        successMessage: 'Sent.',
      },
      items: [],
      latestPosts: { show: false },
      newsletter: {
        consentText: 'Consent copy',
        heading: 'Join the newsletter',
        show: true,
        submitLabel: 'Join',
        successMessage: 'Joined.',
      },
      socialLinks: [],
    })
    payload.find.mockResolvedValue({
      docs: [],
      hasNextPage: false,
      hasPrevPage: false,
      limit: 2,
      nextPage: null,
      page: 1,
      prevPage: null,
      totalDocs: 0,
      totalPages: 0,
    })

    const { container } = render(
      <SiteConfigProvider config={siteConfig}>
        {await SiteFooter({ siteConfig })}
      </SiteConfigProvider>,
    )
    const sections = container.querySelectorAll('.footer-conversion-section')
    expect(sections).toHaveLength(2)
    expect(sections[0]?.classList.contains('footer-newsletter-section')).toBe(true)
    expect(sections[1]?.classList.contains('footer-contact-section')).toBe(true)
    expect(screen.getByRole('heading', { name: 'Join the newsletter' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Start a conversation' })).toBeTruthy()
  })
})
