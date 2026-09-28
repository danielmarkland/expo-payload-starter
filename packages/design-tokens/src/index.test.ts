import { describe, expect, it } from 'vitest'

import { brand, getPresetTokens, resolveThemeMode, themes } from './index.js'

describe('shared brand and theme tokens', () => {
  it('defines matching colors for both platform themes', () => {
    expect(Object.keys(themes.light).sort()).toEqual(
      Object.keys(themes.dark).sort(),
    )
    expect(themes.dark.primary).toBe('#eec784')
    expect(themes.light.primary).toBe('#eec784')
    expect(themes.dark.secondary).toBe('#d2c7b8')
    expect(themes.light.secondary).toBe('#6e685d')
    expect(themes.dark.accentSoft).toBe('#363431')
    expect(themes.light.accentSoft).toBe('#e2e1df')
    expect(themes.dark.danger).toBe('#f87171')
    expect(themes.light.danger).toBe('#b91c1c')
    expect(themes.dark.warning).toBe('#facc15')
    expect(themes.light.warning).toBe('#854d0e')
  })

  it('uses a manual preference before the system setting', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('dark')
    expect(resolveThemeMode('dark', null)).toBe('dark')
    expect(resolveThemeMode(null, null)).toBe('dark')
    expect(resolveThemeMode('unspecified', null)).toBe('dark')
  })

  it('provides display branding and shared asset references', () => {
    expect(brand.siteTitle).toBe(brand.appTitle)
    expect(brand.shortName.length).toBeLessThanOrEqual(12)
    expect(brand.assets.fonts.regular).toContain('.ttf')
  })

  it('resolves curated spacing and shape presets', () => {
    expect(getPresetTokens('compact', 'square').spacing.lg).toBe(19)
    expect(getPresetTokens('comfortable', 'soft').radii.md).toBe(14)
    expect(getPresetTokens('spacious', 'rounded').radii.lg).toBe(27)
  })
})
