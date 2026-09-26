import { describe, expect, it } from 'vitest'

import { brand, resolveThemeMode, themes } from './index.js'

describe('shared brand and theme tokens', () => {
  it('defines matching colors for both platform themes', () => {
    expect(Object.keys(themes.light).sort()).toEqual(
      Object.keys(themes.dark).sort(),
    )
    expect(themes.dark.cobalt).toBe('#1d4ed8')
    expect(themes.light.cobalt).toBe('#1d4ed8')
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
})
