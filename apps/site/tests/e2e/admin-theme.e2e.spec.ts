import { test, expect } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'
const serverURL = process.env.SITE_URL || 'http://localhost:3000'

test.describe('native Automatic admin theme', () => {
  test.use({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } })
  test.beforeAll(async () => {
    await seedTestUser()
  })
  test.afterAll(async () => {
    await cleanupTestUser()
  })
  test('keeps the primary action readable after server rendering in system dark mode', async ({
    page,
  }) => {
    test.setTimeout(90000)
    await login({ page, user: testUser })
    await page.context().clearCookies({ name: 'payload-theme' })
    await page.goto(`${serverURL}/admin`)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const action = page.getByRole('link', { name: /New Post/ })
    await expect(action).toBeVisible()
    const colors = await action.evaluate((element) => {
      const style = getComputedStyle(element)
      return { foreground: style.color, background: style.backgroundColor }
    })
    const luminance = (color: string) => {
      const rgb = color
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number)
      if (!rgb || rgb.length !== 3 || color === 'rgba(0, 0, 0, 0)')
        throw new Error(`Expected opaque native button color: ${color}`)
      const linear = rgb.map((value) => {
        const channel = value / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
    }
    const values = [luminance(colors.foreground), luminance(colors.background)].sort(
      (a, b) => b - a,
    )
    expect(
      (values[0]! + 0.05) / (values[1]! + 0.05),
      JSON.stringify(colors),
    ).toBeGreaterThanOrEqual(4.5)
    const menu = page.locator('.hamburger').filter({ visible: true }).first()
    await expect(menu).toBeVisible()
    const menuColors = await menu.evaluate((element) => {
      const style = getComputedStyle(element)
      const glyph = element.querySelector('svg .stroke')
      const stroke = glyph ? getComputedStyle(glyph).stroke : style.color
      return { foreground: stroke, background: style.backgroundColor }
    })
    const menuValues = [luminance(menuColors.foreground), luminance(menuColors.background)].sort(
      (a, b) => b - a,
    )
    await page.screenshot({ path: test.info().outputPath('automatic-theme.png') })
    expect(
      (menuValues[0]! + 0.05) / (menuValues[1]! + 0.05),
      JSON.stringify(menuColors),
    ).toBeGreaterThanOrEqual(3)
  })
})
