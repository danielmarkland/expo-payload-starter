import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SiteConfig } from '@starter/contracts'

const payload = vi.hoisted(() => ({
  find: vi.fn(),
  findGlobal: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload: vi.fn(async () => payload) }))
vi.mock('@/payload.config', () => ({ default: {} }))

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
  links: { appUrl: 'https://app.example.com' },
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
      items: [{ id: 'privacy', label: 'Privacy', type: 'url', url: '/privacy' }],
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
      docs: [
        { id: 2, publishedAt: '2026-06-30T12:00:00.000Z', slug: 'risk', title: 'What Risk Means' },
        {
          id: 1,
          publishedAt: '2026-06-16T12:00:00.000Z',
          slug: 'backtesting',
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
    expect(screen.getByRole('heading', { name: 'Research & Analysis' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'What Risk Means' }).getAttribute('href')).toBe(
      '/posts/risk',
    )
    expect(screen.getByRole('link', { name: 'Open app' }).getAttribute('href')).toBe(
      'https://app.example.com',
    )
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
    payload.find.mockResolvedValue({ docs: [] })

    render(await SiteFooter({ siteConfig }))

    expect(screen.getByText('A useful site description.')).toBeTruthy()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(screen.getAllByText(/Example Site/).length).toBeGreaterThan(0)
  })
})
