import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import { createHeroHeadline } from '../../src/lib/heroHeadline.js'

test.describe('Frontend', () => {
  const slug = `e2e-page-${Date.now()}`
  let pageId: number

  test.beforeAll(async () => {
    const payload = await getPayload({ config })
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'CMS page fixture',
        slug,
        layout: [{ blockType: 'hero', heading: createHeroHeadline('A page composed in Payload') }],
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
  })

  test('renders a published CMS page by its slug', async ({ page }) => {
    await page.goto(`http://localhost:3000/${slug}`)

    await expect(page).toHaveTitle(/CMS page fixture/)
    await expect(
      page.getByRole('heading', { name: 'A page composed in Payload', level: 1 }),
    ).toBeVisible()
    await expect(page.getByRole('contentinfo')).toContainText('Daniel Markland')
  })
})
