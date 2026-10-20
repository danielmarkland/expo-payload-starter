const serverURL = process.env.SITE_URL || 'http://localhost:3000'
import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import { createHeroHeadline } from '@danielmarkland/publishing-core'

test.describe('Frontend', () => {
  const slug = `e2e-page-${Date.now()}`
  let pageId: number
  let previousFooter:
    Awaited<ReturnType<Awaited<ReturnType<typeof getPayload>>['findGlobal']>> | undefined

  test.beforeAll(async () => {
    const payload = await getPayload({ config })
    previousFooter = await payload.findGlobal({ slug: 'footerNavigation' })
    await payload.updateGlobal({
      slug: 'footerNavigation',
      data: {
        contentAreas: [
          {
            columns: [
              {
                blocks: [
                  { blockType: 'logo' },
                  { blockType: 'copyright', owner: 'Frontend fixture owner' },
                ],
              },
            ],
          },
        ],
      },
    })
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'CMS page fixture',
        slug,
        layout: [
          {
            blockType: 'hero',
            anchor: 'e2e-intro',
            eyebrow: 'A page section',
            heading: createHeroHeadline('A page composed in Payload'),
          },
        ],
        _status: 'published',
      },
      draft: false,
      overrideAccess: true,
    })
    pageId = page.id
  })

  test.afterAll(async () => {
    if (!pageId) return
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'pages', id: pageId, overrideAccess: true })
    if (previousFooter)
      await payload.updateGlobal({ slug: 'footerNavigation', data: previousFooter })
  })

  test('renders a published CMS page by its slug', async ({ page }) => {
    await page.goto(`${serverURL}/${slug}`)

    await expect(page).toHaveTitle(/CMS page fixture/)
    await expect(
      page.getByRole('heading', { name: 'A page composed in Payload', level: 1 }),
    ).toBeVisible()
    await expect(page.locator('#e2e-intro')).toBeVisible()
    await expect(page.locator('#e2e-intro .eyebrow')).toHaveText('A page section')
    await expect(page.getByRole('contentinfo')).toContainText('Frontend fixture owner')
  })
})
