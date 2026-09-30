import { describe, expect, it } from 'vitest'

import { themes } from '@danielmarkland/design-tokens'
import { colorContrastRatio, validatePaletteColor } from '@/lib/colorContrast'

describe('palette color contrast', () => {
  it('calculates WCAG contrast ratios', () => {
    expect(colorContrastRatio('#000000', '#ffffff')).toBe(21)
    expect(colorContrastRatio('#767676', '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(colorContrastRatio('#777777', '#ffffff')).toBeLessThan(4.5)
  })

  it('validates hex values and required text pairs', () => {
    const validatePrimary = validatePaletteColor('primary')
    const validateAccent = validatePaletteColor('accent')

    expect(validatePrimary('red', {} as never)).toMatch(/six-digit hex color/)
    expect(
      validatePrimary('#ffffff', {
        siblingData: { primaryInk: '#ffffff' },
      } as never),
    ).toMatch(/4\.5:1 contrast.*1\.00:1/)
    expect(
      validateAccent('#6e685d', {
        siblingData: { surface: '#ffffff', surfaceRaised: '#ffffff' },
      } as never),
    ).toBe(true)
  })

  it('keeps the curated light and dark defaults accessible', () => {
    for (const mode of ['light', 'dark'] as const) {
      const theme = themes[mode]
      const palette = {
        accent: theme.secondary,
        border: theme.border,
        ink: theme.ink,
        inkMuted: theme.inkMuted,
        primary: theme.primary,
        primaryInk: theme.primaryInk,
        surface: theme.surface,
        surfaceRaised: theme.surfaceRaised,
      }

      for (const [name, value] of Object.entries(palette)) {
        expect(
          validatePaletteColor(name as keyof typeof palette)(value, {
            siblingData: palette,
          } as never),
        ).toBe(true)
      }

      expect(colorContrastRatio(theme.danger, theme.surface)).toBeGreaterThanOrEqual(4.5)
      expect(colorContrastRatio(theme.warning, theme.surface)).toBeGreaterThanOrEqual(4.5)
    }
  })
})
