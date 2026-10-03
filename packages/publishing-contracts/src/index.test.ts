import { describe, expect, it } from 'vitest'

import {
  contactSubmissionSchema,
  newsletterSubmissionSchema,
  siteConfigSchema,
} from './index.js'

const themeColors = Object.fromEntries(
  [
    'accentSoft',
    'border',
    'borderInput',
    'danger',
    'ink',
    'inkBody',
    'inkDim',
    'inkFaint',
    'inkGhost',
    'inkInverse',
    'inkLight',
    'inkMuted',
    'inkSubtle',
    'lineStrong',
    'primary',
    'primaryHover',
    'primaryInk',
    'secondary',
    'surface',
    'surfaceFooter',
    'surfaceInput',
    'surfaceRaised',
    'surfaceSection',
    'surfaceTop',
    'warning',
  ].map((key) => [key, '#123456']),
)

describe('publishing contracts', () => {
  it('accepts valid public form submissions', () => {
    expect(
      newsletterSubmissionSchema.parse({
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        turnstileToken: 'verified',
      }).website,
    ).toBe('')
    expect(
      contactSubmissionSchema.parse({
        email: 'ada@example.com',
        message: 'I would like to discuss a project.',
        name: 'Ada Lovelace',
        turnstileToken: 'verified',
      }).website,
    ).toBe('')
  })

  it('normalizes a runtime site configuration', () => {
    const parsed = siteConfigSchema.parse({
      version: 1,
      identity: {
        appTitle: 'Example App',
        description: 'Example description',
        faviconUrl: null,
        logoUrl: null,
        shortName: 'Example',
        siteTitle: 'Example Site',
      },
      theme: {
        allowToggle: true,
        dark: { ...themeColors, dangerAlpha: '#12345678' },
        defaultMode: 'system',
        densityPreset: 'comfortable',
        fontPreset: 'poppins',
        light: { ...themeColors, dangerAlpha: '#12345678' },
        shapePreset: 'soft',
      },
    })

    expect(parsed.identity.darkLogoUrl).toBeNull()
    expect(parsed.integrations.googleTagManagerId).toBeNull()
    expect(parsed.theme.buttonShape).toBe('square')
  })

  it('rejects arbitrary CSS in color values', () => {
    expect(() =>
      siteConfigSchema.parse({
        version: 1,
        identity: {
          appTitle: 'Example',
          description: 'Example',
          faviconUrl: null,
          logoUrl: null,
          shortName: 'Example',
          siteTitle: 'Example',
        },
        theme: {
          allowToggle: true,
          dark: {
            ...themeColors,
            dangerAlpha: '#12345678',
            primary: 'red; url(evil)',
          },
          defaultMode: 'system',
          densityPreset: 'comfortable',
          fontPreset: 'poppins',
          light: { ...themeColors, dangerAlpha: '#12345678' },
          shapePreset: 'soft',
        },
      }),
    ).toThrow()
  })
})
