import { describe, expect, it } from 'vitest'
import {
  archivePageNumber,
  latestPostsQuery,
  orderSelectedPosts,
  selectedPostIDsSchema,
} from './postSelection.js'
describe('public post selection', () => {
  it('validates IDs, rejects invalid/oversized selections and deduplicates', () => {
    expect(selectedPostIDsSchema.parse('3,1,3')).toEqual([3, 1])
    for (const value of [
      '',
      '0',
      '-1',
      '1.5',
      '1,',
      '9007199254740992',
      Array.from({ length: 13 }, (_, i) => i + 1).join(','),
    ])
      expect(selectedPostIDsSchema.safeParse(value).success).toBe(false)
  })
  it('orders only returned authorized posts; absent selections are not replaced', () => {
    expect(orderSelectedPosts([{ id: 1 }, { id: 3 }], [3, 2, 1, 3])).toEqual([
      { id: 3 },
      { id: 1 },
    ])
  })
  it('builds category and curated queries without falling back to all posts', () => {
    expect(
      latestPostsQuery({ source: 'category', category: 4, limit: 3 }),
    ).toBe('?limit=3&categoryId=4')
    expect(latestPostsQuery({ source: 'category' })).toBeNull()
    expect(
      latestPostsQuery({ source: 'selected', selectedPosts: [3, 1] }),
    ).toBe('?limit=2&ids=3%2C1')
    expect(
      latestPostsQuery({ source: 'selected', selectedPosts: [] }),
    ).toBeNull()
  })
  it('accepts valid archive pages and rejects ambiguous or malformed input', () => {
    expect(archivePageNumber(undefined)).toBe(1)
    expect(archivePageNumber('2')).toBe(2)
    for (const value of [
      '0',
      '-1',
      '1.5',
      '1e2',
      '',
      ['1', '2'],
      '9007199254740992',
    ])
      expect(archivePageNumber(value)).toBeNull()
  })
})
