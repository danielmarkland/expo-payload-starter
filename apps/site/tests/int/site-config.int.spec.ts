import { describe, expect, it } from 'vitest'

import { siteConfigSchema } from '@starter/contracts'
import { themes } from '@starter/design-tokens'
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
        logo: { url: '/api/media/file/logo.svg' } as SiteSetting['logo'],
        shortName: 'Acme',
        siteTitle: 'Acme Studio',
        theme: {
          allowToggle: false,
          dark: { primary: '#123456' },
          defaultMode: 'dark',
          densityPreset: 'compact',
          fontPreset: 'system',
          shapePreset: 'rounded',
        },
      }),
      'https://example.com',
    )

    expect(siteConfigSchema.parse(config)).toEqual(config)
    expect(config.identity.logoUrl).toBe('https://example.com/api/media/file/logo.svg')
    expect(config.theme.dark.primary).toBe('#123456')
    expect(config.theme.dark.surface).toBe(themes.dark.surface)
  })

  it('emits palette and preset CSS variables', () => {
    const css = siteConfigCSS(
      resolveSiteConfig(settings({ theme: { densityPreset: 'compact', shapePreset: 'square' } })),
    )

    expect(css).toContain('--space-lg:19px')
    expect(css).toContain('--radius-lg:0px')
    expect(css).toContain(":root[data-theme='light']")
  })
})
