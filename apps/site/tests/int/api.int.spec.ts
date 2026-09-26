import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

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
        layout: [{ blockType: 'hero', heading: 'A private draft' }],
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
})
