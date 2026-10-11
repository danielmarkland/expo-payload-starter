import { describe, expect, it } from 'vitest'
import { headerNavigationSchema } from './api.js'

describe('header background contract', () => {
  it('accepts legacy navigation, null settings and all four combinations', () => {
    expect(
      headerNavigationSchema.parse({ showSearch: true }).topBackground,
    ).toBeUndefined()
    expect(
      headerNavigationSchema.parse({
        showSearch: true,
        topBackground: null,
        scrolledBackground: null,
      }).topBackground,
    ).toBeNull()
    for (const topBackground of ['fill', 'transparent'])
      for (const scrolledBackground of ['fill', 'transparent']) {
        expect(
          headerNavigationSchema.parse({
            showSearch: true,
            topBackground,
            scrolledBackground,
          }),
        ).toMatchObject({ topBackground, scrolledBackground })
      }
  })
  it('rejects unsupported backgrounds', () => {
    expect(
      headerNavigationSchema.safeParse({
        showSearch: true,
        topBackground: 'blur',
      }).success,
    ).toBe(false)
    expect(
      headerNavigationSchema.safeParse({
        showSearch: true,
        scrolledBackground: 'blur',
      }).success,
    ).toBe(false)
  })
})
