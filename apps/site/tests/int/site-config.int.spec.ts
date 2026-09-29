import { describe, expect, it } from 'vitest'

import { siteConfigSchema } from '@starter/contracts'
import { resolveSiteConfig, siteConfigCSS } from '@/lib/siteConfig'
import type { SiteSetting } from '@/payload-types'

function settings(overrides: Record<string, unknown> = {}): SiteSetting {
  return {
    id: 1,
    siteDescription: 'A configurable starter.',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  } as SiteSetting
}

describe('runtime site config', () => {
  it('normalizes Payload settings into the public contract', () => {
    const config = resolveSiteConfig(
      settings({
        appTitle: 'Acme App',
        buttons: { shape: 'pill' },
        darkLogo: { url: '/api/media/file/logo-dark.svg' },
        integrations: {
          googleTagManagerId: 'GTM-ABC123',
          turnstileSiteKey: 'turnstile-site-key',
        },
        lightLogo: { url: '/api/media/file/logo-light.svg' },
        links: { appUrl: 'https://app.example.com' },
        shortName: 'Acme',
        siteTitle: 'Acme Studio',
        theme: {
          allowToggle: false,
          dark: { accent: '#ffffff', primary: '#123456', surface: '#000000' },
          defaultMode: 'dark',
          densityPreset: 'compact',
          fontPreset: 'system',
          shapePreset: 'rounded',
        },
      }),
      'https://example.com',
    )

    expect(siteConfigSchema.parse(config)).toEqual(config)
    expect(config.identity.darkLogoUrl).toBe('https://example.com/api/media/file/logo-dark.svg')
    expect(config.identity.lightLogoUrl).toBe('https://example.com/api/media/file/logo-light.svg')
    expect(config.identity.logoUrl).toBe('https://example.com/api/media/file/logo-dark.svg')
    expect(config.integrations.googleTagManagerId).toBe('GTM-ABC123')
    expect(config.integrations.turnstileSiteKey).toBe('turnstile-site-key')
    expect(config.links.appUrl).toBe('https://app.example.com')
    expect(config.theme.dark.primary).toBe('#123456')
    expect(config.theme.buttonShape).toBe('pill')
    expect(config.theme.dark.secondary).toBe('#ffffff')
    expect(config.theme.dark.accentSoft).toBe('#333333')
  })

  it('emits palette and preset CSS variables', () => {
    const css = siteConfigCSS(
      resolveSiteConfig(settings({ theme: { densityPreset: 'compact', shapePreset: 'square' } })),
    )

    expect(css).toContain('--space-lg:19px')
    expect(css).toContain('--radius-lg:0px')
    expect(css).toContain('--radius-button:0px')
    expect(css).toContain(":root[data-theme='light']")
  })

  it('emits button radii independently from the site shape preset', () => {
    const css = siteConfigCSS(
      resolveSiteConfig(settings({ buttons: { shape: 'pill' }, theme: { shapePreset: 'square' } })),
    )

    expect(css).toContain('--radius-lg:0px')
    expect(css).toContain('--radius-button:999px')
  })
})
