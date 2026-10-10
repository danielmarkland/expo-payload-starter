import { describe, expect, it } from 'vitest'
import {
  buttonClassName,
  createHeroHeadline,
  extractSearchText,
  resolveRedirect,
  sectionAppearanceClassName,
} from './index.js'

describe('publishing core', () => {
  it('provides shared presentation and content behavior', () => {
    expect(buttonClassName('secondary-outline')).toBe(
      'button button-secondary-outline',
    )
    expect(extractSearchText({ title: 'Hello', slug: 'ignored' })).toBe('Hello')
    expect(sectionAppearanceClassName(['block'], { rounded: true })).toBe(
      'block section-width-page page-block-rounded',
    )
    expect(
      createHeroHeadline('Hello').root.children[0]?.children[0]?.text,
    ).toBe('Hello')
    expect(
      resolveRedirect({ type: '301', to: { type: 'custom', url: '/next' } }),
    ).toEqual({ destination: '/next', status: 301 })
  })
})
