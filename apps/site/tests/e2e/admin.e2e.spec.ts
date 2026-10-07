import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/users')
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })

  test('uses color pickers for the site theme palettes', async () => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/admin/globals/siteSettings')

    // Payload persists the active tab; select it explicitly, including on retries.
    await page.getByRole('button', { exact: true, name: 'General' }).click()
    await expect(page.locator('input[name="siteTitle"]')).toBeVisible()
    const siteDescription = page.locator('textarea[name="siteDescription"]')
    const seoTitle = page.locator('input[name="meta.title"]')
    await expect(siteDescription).toBeHidden()
    await expect(seoTitle).toBeHidden()
    await page.getByRole('button', { exact: true, name: 'Branding' }).click()
    await expect(page.getByText('Light logo', { exact: true })).toBeVisible()
    await expect(siteDescription).toBeHidden()
    await expect(seoTitle).toBeHidden()
    await page.getByRole('button', { exact: true, name: 'Appearance' }).click()
    await expect(page.getByText('Light palette', { exact: true })).toBeVisible()
    await expect(siteDescription).toBeHidden()
    await expect(seoTitle).toBeHidden()
    await page.getByRole('button', { exact: true, name: 'SEO' }).click()
    await expect(siteDescription).toBeVisible()
    await expect(seoTitle).toBeVisible()
    await page.getByRole('button', { exact: true, name: 'Appearance' }).click()
    await expect(siteDescription).toBeHidden()
    await expect(seoTitle).toBeHidden()

    const palettePickers = page.locator(
      'input[type="color"][name^="theme.light."], input[type="color"][name^="theme.dark."]',
    )
    await expect(palettePickers).toHaveCount(20)
    await expect(palettePickers.first()).toHaveValue(/^#[0-9a-f]{6}$/)
    await expect(page.getByText(/as a six-digit hexadecimal color/i)).toHaveCount(0)

    const lightPickerTops = await page
      .locator('input[type="color"][name^="theme.light."]')
      .evaluateAll((pickers) =>
        pickers.map((picker) =>
          Math.round(picker.closest('.color-picker-field')?.getBoundingClientRect().top ?? 0),
        ),
      )
    expect(new Set(lightPickerTops.slice(0, 4)).size).toBe(1)
    expect(lightPickerTops[4]).toBeGreaterThan(lightPickerTops[0])

    const primary = page.locator('input[type="color"][name="theme.light.primary"]')
    const primaryInk = page.locator('input[type="color"][name="theme.light.primaryInk"]')
    await primary.fill(await primaryInk.inputValue())
    await primary.blur()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/need at least 4\.5:1 contrast/).first()).toBeVisible({
      timeout: 30_000,
    })
  })
})
