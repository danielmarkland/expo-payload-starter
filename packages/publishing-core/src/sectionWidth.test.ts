import { describe, expect, it } from 'vitest'
import { resolveSectionWidth, sectionWidthField } from './sectionWidth.js'
import { sectionAppearanceClassName } from './sectionAppearance.js'

describe('section width inheritance', () => {
  it('defaults missing documents to padded', () => {
    expect(resolveSectionWidth({})).toBe('padded')
    expect(resolveSectionWidth({ site: null, page: null, block: null })).toBe(
      'padded',
    )
  })
  for (const site of ['full', 'padded'] as const)
    for (const page of ['site', 'full', 'padded'] as const)
      for (const block of ['page', 'full', 'padded'] as const)
        it(`${site} → ${page} → ${block}`, () => {
          expect(resolveSectionWidth({ site, page, block })).toBe(
            block !== 'page' ? block : page !== 'site' ? page : site,
          )
        })
  it('defines only the requested choices and defaults', () => {
    for (const level of ['site', 'page', 'block'] as const) {
      const field = sectionWidthField(level)
      expect(field.type).toBe('select')
      expect(field.defaultValue).toBe(
        level === 'site' ? 'padded' : level === 'page' ? 'site' : 'page',
      )
    }
    expect(sectionAppearanceClassName(['page-block'])).toBe(
      'page-block section-width-page',
    )
  })
})
