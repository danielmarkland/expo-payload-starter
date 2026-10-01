import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { createHeroHeadline } from '@danielmarkland/publishing-core'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  it('keeps draft pages private and allows published pages to be read publicly', async () => {
    const slug = `page-access-${Date.now()}`
    const created = await payload.create({
      collection: 'pages',
      data: {
        title: 'Page access fixture',
        slug,
        layout: [{ blockType: 'hero', heading: createHeroHeadline('A private draft') }],
      },
      draft: true,
      overrideAccess: true,
    })

    try {
      const hiddenDraft = await payload.find({
        collection: 'pages',
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
      expect(hiddenDraft.docs).toHaveLength(0)

      const previewDraft = await payload.find({
        collection: 'pages',
        draft: true,
        overrideAccess: true,
        where: { slug: { equals: slug } },
      })
      expect(previewDraft.docs).toHaveLength(1)

      await payload.update({
        collection: 'pages',
        id: created.id,
        data: { _status: 'published' },
        draft: false,
        overrideAccess: true,
      })

      const publishedPage = await payload.find({
        collection: 'pages',
        overrideAccess: false,
        where: { slug: { equals: slug } },
      })
      expect(publishedPage.docs).toHaveLength(1)
    } finally {
      await payload.delete({ collection: 'pages', id: created.id, overrideAccess: true })
    }
  })

  it('supports editorial taxonomy, authors, and published-content search', async () => {
    const suffix = Date.now()
    const category = await payload.create({
      collection: 'categories',
      data: { title: `Category ${suffix}`, slug: `category-${suffix}` },
      overrideAccess: true,
    })
    const tag = await payload.create({
      collection: 'tags',
      data: { title: `Tag ${suffix}`, slug: `tag-${suffix}` },
      overrideAccess: true,
    })
    const author = await payload.create({
      collection: 'authors',
      data: { name: `Author ${suffix}`, slug: `author-${suffix}` },
      overrideAccess: true,
    })
    let postId: number | undefined

    try {
      const post = await payload.create({
        collection: 'posts',
        data: {
          title: `Searchable title ${suffix}`,
          slug: `searchable-post-${suffix}`,
          summary: `Summary needle-${suffix}`,
          body: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: `Body phrase-${suffix}`, version: 1 }],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          author: author.id,
          categories: [category.id],
          tags: [tag.id],
          _status: 'published',
        },
        draft: false,
        overrideAccess: true,
      })
      postId = post.id

      const categorizedPosts = await payload.find({
        collection: 'posts',
        overrideAccess: false,
        where: {
          and: [
            { author: { equals: author.id } },
            { categories: { equals: category.id } },
            { tags: { equals: tag.id } },
          ],
        },
      })
      expect(categorizedPosts.docs.map(({ id }) => id)).toContain(post.id)

      const searchResults = await payload.find({
        collection: 'search',
        overrideAccess: false,
        where: { searchText: { like: `needle-${suffix}` } },
      })
      expect(
        searchResults.docs.some(({ doc }) => doc.relationTo === 'posts' && doc.value === post.id),
      ).toBe(true)
    } finally {
      if (postId !== undefined) {
        await payload.delete({ collection: 'posts', id: postId, overrideAccess: true })
      }
      await payload.delete({ collection: 'authors', id: author.id, overrideAccess: true })
      await payload.delete({ collection: 'tags', id: tag.id, overrideAccess: true })
      await payload.delete({ collection: 'categories', id: category.id, overrideAccess: true })
    }
  })
})
