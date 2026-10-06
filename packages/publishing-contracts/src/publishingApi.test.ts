import { describe, it, expect } from 'vitest'
import {
  publishingPostsQuerySchema,
  publishingTaxonomyRoute,
  publishingErrorResponses,
} from './publishingApi.js'
import { apiErrorSchema } from './api.js'
describe('canonical publishing API contracts', () => {
  it('retains default pagination and parses ordered selected IDs', () => {
    expect(publishingPostsQuerySchema.parse({})).toEqual({ limit: 12, page: 1 })
    expect(
      publishingPostsQuerySchema.parse({ ids: '3,1,3', limit: '2', page: '4' })
        .ids,
    ).toEqual([3, 1])
  })
  it.each(['0', '-1', 'a', '1,,2', '1.5'])(
    'rejects invalid IDs instead of silently listing all posts',
    (ids) => {
      expect(publishingPostsQuerySchema.safeParse({ ids }).success).toBe(false)
    },
  )
  it('documents upstream/conflict errors and taxonomy endpoints', () => {
    expect(publishingErrorResponses).toHaveProperty('502')
    expect(publishingErrorResponses).toHaveProperty('409')
    expect(
      apiErrorSchema.safeParse({ error: { code: 'conflict', message: 'Busy' } })
        .success,
    ).toBe(true)
    expect(publishingTaxonomyRoute('authors').path).toBe('/authors/{slug}')
  })
})
