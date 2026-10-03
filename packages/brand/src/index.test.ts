import { describe, expect, it } from 'vitest'

import { brand, THEME_STORAGE_KEY } from './index.js'

describe('starter brand', () => {
  it('defines valid display metadata and assets', () => {
    expect(brand.siteTitle).toBe(brand.appTitle)
    expect(brand.shortName.length).toBeLessThanOrEqual(12)
    expect(brand.assets.appIcon).toMatch(/\.png$/)
    expect(THEME_STORAGE_KEY).toBe(brand.themeStorageKey)
  })
})
