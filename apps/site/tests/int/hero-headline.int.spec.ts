import { describe, expect, it } from 'vitest'

import { createHeroHeadline, validateHeroHeadline } from '@/lib/heroHeadline'

describe('hero headline helpers', () => {
  it('marks only configured phrases with the accent text state', () => {
    const headline = createHeroHeadline('Build with React (and TypeScript).', [
      'React (and TypeScript)',
    ])
    const children = headline.root.children[0].children

    expect(children).toEqual([
      expect.objectContaining({ text: 'Build with ' }),
      expect.objectContaining({ $: { tone: 'accent' }, text: 'React (and TypeScript)' }),
      expect.objectContaining({ text: '.' }),
    ])
  })

  it('requires a single paragraph while allowing inline content', () => {
    const headline = createHeroHeadline('One headline')
    expect(validateHeroHeadline(headline)).toBe(true)
    expect(
      validateHeroHeadline({
        root: {
          children: [headline.root.children[0], headline.root.children[0]],
        },
      }),
    ).toBe('Use a single paragraph. Press Shift+Enter to add a line break.')
  })
})
