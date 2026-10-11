// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'
import { createHeroHeadline } from '@danielmarkland/publishing-core'
import config from '@/payload.config'

let payload: Payload
beforeAll(async () => {
  payload = await getPayload({ config })
})
describe('hero layout persistence', () => {
  it('saves and reloads viewport height and each alignment in content and drafts', async () => {
    const page = await payload.create({
      collection: 'pages',
      draft: true,
      overrideAccess: true,
      data: {
        title: 'Hero layout fixture',
        slug: `hero-layout-${crypto.randomUUID()}`,
        layout: [
          {
            blockType: 'hero',
            heading: createHeroHeadline('Hero'),
            height: 'viewport',
            verticalAlignment: 'top',
          },
        ],
      },
    })
    try {
      for (const verticalAlignment of ['top', 'middle', 'bottom'] as const) {
        await payload.update({
          collection: 'pages',
          id: page.id,
          draft: true,
          overrideAccess: true,
          data: {
            layout: [
              {
                blockType: 'hero',
                heading: createHeroHeadline('Hero'),
                height: 'viewport',
                verticalAlignment,
              },
            ],
          },
        })
        const loaded = await payload.findByID({
          collection: 'pages',
          id: page.id,
          draft: true,
          overrideAccess: true,
        })
        expect(loaded.layout?.[0]).toMatchObject({ height: 'viewport', verticalAlignment })
        const versions = await payload.findVersions({
          collection: 'pages',
          where: { parent: { equals: page.id } },
          sort: '-updatedAt',
          limit: 1,
          overrideAccess: true,
        })
        expect(versions.docs[0].version.layout?.[0]).toMatchObject({
          height: 'viewport',
          verticalAlignment,
        })
      }
    } finally {
      await payload.delete({ collection: 'pages', id: page.id, overrideAccess: true })
    }
  })
})
