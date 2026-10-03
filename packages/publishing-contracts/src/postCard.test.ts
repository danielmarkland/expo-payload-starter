import { describe, expect, it } from 'vitest'
import { postCardSchema, postSchema } from './api.js'
const card = { id: '1', slug: 'example', title: 'Example', summary: 'Summary' }
describe('post-card contract', () => {
  it('supports populated, unresolved, and missing images', () => {
    for (const image of [
      null,
      42,
      'media-1',
      { id: 1, alt: 'Cover', url: '/cover.jpg' },
    ]) {
      expect(
        postCardSchema.parse({ ...card, meta: { image } }).meta?.image,
      ).toEqual(image)
    }
    expect(postCardSchema.parse(card).meta).toBeUndefined()
  })
  it('rejects malformed content and preserves additive post fields', () => {
    expect(postCardSchema.safeParse({ ...card, summary: 1 }).success).toBe(
      false,
    )
    expect(
      postCardSchema.safeParse({
        ...card,
        meta: { image: { url: '/cover.jpg' } },
      }).success,
    ).toBe(false)
    expect(
      postSchema.parse({ ...card, body: {}, customField: 'extra' }).customField,
    ).toBe('extra')
  })
})
