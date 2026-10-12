import { describe, expect, it } from 'vitest'
import { createHeroHeadline, validateHeroHeadline } from './heroHeadline.js'

describe('required hero headings', () => {
  it('rejects missing, malformed and blank headings', () => {
    for (const value of [
      null,
      undefined,
      {},
      { root: { children: {} } },
      createHeroHeadline(''),
      createHeroHeadline('   '),
    ])
      expect(validateHeroHeadline(value)).toBe('Enter a hero heading.')
  })

  it('accepts a populated paragraph and preserves the single-paragraph rule', () => {
    const heading = createHeroHeadline('Welcome')
    expect(validateHeroHeadline(heading)).toBe(true)
    heading.root.children.push(heading.root.children[0]!)
    expect(validateHeroHeadline(heading)).toContain('single paragraph')
  })
})
