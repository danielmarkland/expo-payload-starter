import { describe, expect, it } from 'vitest'
import { getNavigationHref, getSafeExternalHref } from './navigation.js'
import { extractPostHeadings } from './postHeadings.js'
describe('publishing content helpers', () => {
  it('resolves only published populated destinations and safe URLs', () => {
    expect(
      getNavigationHref({
        type: 'page',
        page: { id: 1, slug: 'home', _status: 'published' },
      }),
    ).toBe('/')
    expect(
      getNavigationHref({
        type: 'post',
        post: { id: 'a', slug: 'a b', _status: 'published' },
      }),
    ).toBe('/posts/a%20b')
    expect(getNavigationHref({ type: 'page', page: 1 })).toBeNull()
    expect(
      getNavigationHref({
        type: 'page',
        page: { id: 1, slug: 'private', _status: 'draft' },
      }),
    ).toBeNull()
    for (const value of ['javascript:alert(1)', '//example.com', '#Invalid'])
      expect(getSafeExternalHref(value)).toBeNull()
    expect(getNavigationHref({ url: '/legacy' })).toBe('/legacy')
  })
  it('normalizes headings and handles collisions and empty headings', () => {
    const heading = (text: string) => ({
      type: 'heading',
      version: 1,
      tag: 'h2',
      children: [{ type: 'text', version: 1, text }],
    })
    expect(
      extractPostHeadings({
        root: {
          type: 'root',
          version: 1,
          children: [
            heading('Café'),
            heading('Cafe'),
            heading(''),
            heading('!!!'),
          ],
        },
      }),
    ).toEqual([
      { id: 'cafe', level: 2, text: 'Café' },
      { id: 'cafe-2', level: 2, text: 'Cafe' },
      { id: 'section', level: 2, text: '!!!' },
    ])
  })
})
