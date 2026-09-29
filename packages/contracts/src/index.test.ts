import { describe, expect, it } from 'vitest'

import {
  contactSubmissionSchema,
  newsletterSubmissionSchema,
  profileSchema,
  siteConfigSchema,
} from './index.js'

const themeColors = {
  accentSoft: '#123456',
  border: '#123456',
  borderInput: '#123456',
  danger: '#123456',
  dangerAlpha: '#12345678',
  ink: '#123456',
  inkBody: '#123456',
  inkDim: '#123456',
  inkFaint: '#123456',
  inkGhost: '#123456',
  inkInverse: '#123456',
  inkLight: '#123456',
  inkMuted: '#123456',
  inkSubtle: '#123456',
  lineStrong: '#123456',
  primary: '#123456',
  primaryHover: '#123456',
  primaryInk: '#123456',
  secondary: '#123456',
  surface: '#123456',
  surfaceFooter: '#123456',
  surfaceInput: '#123456',
  surfaceRaised: '#123456',
  surfaceSection: '#123456',
  surfaceTop: '#123456',
  warning: '#123456',
}

describe('profileSchema', () => {
  it('accepts the public profile contract', () => {
    expect(
      profileSchema.parse({
        avatarUrl: null,
        createdAt: '2026-09-25T12:00:00.000Z',
        displayName: 'Ada',
        id: crypto.randomUUID(),
        updatedAt: '2026-09-25T12:00:00.000Z',
      }).displayName,
    ).toBe('Ada')
  })
})

describe('newsletterSubmissionSchema', () => {
  it('requires names, a valid email, and a verification token', () => {
    expect(
      newsletterSubmissionSchema.parse({
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        turnstileToken: 'verified',
      }),
    ).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', website: '' })
    expect(
      newsletterSubmissionSchema.safeParse({
        email: 'invalid',
        firstName: '',
        lastName: 'Lovelace',
        turnstileToken: '',
      }).success,
    ).toBe(false)
  })
})

describe('siteConfigSchema', () => {
  it('accepts a normalized runtime site configuration', () => {
    expect(
      siteConfigSchema.parse({
        version: 1,
        integrations: {
          googleTagManagerId: 'GTM-ABC123',
          turnstileSiteKey: 'turnstile-site-key',
        },
        identity: {
          appTitle: 'Example App',
          darkLogoUrl: 'https://example.com/logo-dark.png',
          description: 'Example description',
          faviconUrl: null,
          lightLogoUrl: 'https://example.com/logo-light.png',
          logoUrl: 'https://example.com/logo.png',
          shortName: 'Example',
          siteTitle: 'Example Site',
        },
        links: { appUrl: 'https://app.example.com' },
        theme: {
          allowToggle: true,
          buttonShape: 'rounded',
          dark: themeColors,
          defaultMode: 'system',
          densityPreset: 'comfortable',
          fontPreset: 'poppins',
          light: themeColors,
          shapePreset: 'soft',
        },
      }).identity.siteTitle,
    ).toBe('Example Site')
  })

  it('defaults legacy configurations to square buttons', () => {
    const parsed = siteConfigSchema.parse({
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
        dark: themeColors,
        defaultMode: 'system',
        densityPreset: 'comfortable',
        fontPreset: 'poppins',
        light: themeColors,
        shapePreset: 'soft',
      },
    })

    expect(parsed.theme.buttonShape).toBe('square')
    expect(parsed.integrations).toEqual({
      googleTagManagerId: null,
      turnstileSiteKey: null,
    })
    expect(parsed.links).toEqual({ appUrl: null })
  })

  it('rejects arbitrary CSS in color values', () => {
    const result = siteConfigSchema.safeParse({
      version: 1,
      identity: {
        appTitle: 'Example',
        darkLogoUrl: null,
        description: 'Example',
        faviconUrl: null,
        lightLogoUrl: null,
        logoUrl: null,
        shortName: 'Example',
        siteTitle: 'Example',
      },
      theme: {
        allowToggle: true,
        dark: { ...themeColors, primary: 'red; background: url(evil)' },
        defaultMode: 'system',
        densityPreset: 'comfortable',
        fontPreset: 'poppins',
        light: themeColors,
        shapePreset: 'soft',
      },
    })
    expect(result.success).toBe(false)
  })

  it('accepts legacy config responses without theme-specific logos', () => {
    const parsed = siteConfigSchema.parse({
      version: 1,
      identity: {
        appTitle: 'Example',
        description: 'Example',
        faviconUrl: null,
        logoUrl: 'https://example.com/logo.png',
        shortName: 'Example',
        siteTitle: 'Example',
      },
      theme: {
        allowToggle: true,
        dark: themeColors,
        defaultMode: 'system',
        densityPreset: 'comfortable',
        fontPreset: 'poppins',
        light: themeColors,
        shapePreset: 'soft',
      },
    })

    expect(parsed.identity.darkLogoUrl).toBeNull()
    expect(parsed.identity.lightLogoUrl).toBeNull()
  })
})

describe('contactSubmissionSchema', () => {
  it('accepts valid public contact submissions', () => {
    expect(
      contactSubmissionSchema.parse({
        email: 'daniel@example.com',
        message: 'I would like to discuss a project.',
        name: 'Daniel Markland',
        turnstileToken: 'verified-token',
      }),
    ).toMatchObject({ website: '' })
  })

  it('rejects malformed contact submissions', () => {
    expect(() =>
      contactSubmissionSchema.parse({
        email: 'not-an-email',
        message: 'Too short',
        name: 'D',
        turnstileToken: '',
      }),
    ).toThrow()
  })
})
