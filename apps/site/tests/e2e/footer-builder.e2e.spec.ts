import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { login } from '../helpers/login.js'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser.js'

const serverURL = process.env.SITE_URL || 'http://localhost:3000'
test.describe('Visual footer builder', () => {
  let previousFooter:
    Awaited<ReturnType<Awaited<ReturnType<typeof getPayload>>['findGlobal']>> | undefined
  test.beforeAll(async () => {
    test.setTimeout(90_000)
    await seedTestUser()
    const payload = await getPayload({ config })
    previousFooter = await payload.findGlobal({ slug: 'footerNavigation' })
    await payload.updateGlobal({
      slug: 'footerNavigation',
      data: {
        title: 'Editor acceptance',
        contentAreas: [
          {
            id: 'area-one',
            title: 'First area',
            columns: [
              {
                id: 'column-one',
                blocks: [{ id: 'copyright-one', blockType: 'copyright', owner: 'Original owner' }],
              },
              { id: 'column-two', blocks: [] },
            ],
          },
          { id: 'area-two', title: 'Second area', columns: [{ id: 'column-three', blocks: [] }] },
        ],
      },
    })
  })
  test.afterAll(async () => {
    if (previousFooter) {
      const payload = await getPayload({ config })
      await payload.updateGlobal({ slug: 'footerNavigation', data: previousFooter })
    }
    await cleanupTestUser()
  })
  test('edits, moves, reorders, previews, and persists native footer content', async ({ page }) => {
    test.setTimeout(180_000)
    await page.setViewportSize({ width: 1440, height: 1000 })
    await login({ page, user: testUser })
    await page.goto(`${serverURL}/admin/globals/footerNavigation`)
    const editor = page.getByRole('region', { name: 'Footer layout editor' })
    async function removal(action: () => Promise<void>, accept: boolean, message: string) {
      await action()
      const modal = page.locator('.confirmation-modal')
      await expect(modal).toBeVisible()
      await expect(modal.getByText(message, { exact: true })).toBeVisible()
      await modal.getByRole('button', { name: accept ? 'Remove' : 'Cancel', exact: true }).click()
      await expect(modal).not.toBeVisible()
    }

    await expect(editor).toBeVisible()
    await editor.getByRole('button', { name: 'Copyright', exact: true }).click()
    await editor.getByRole('textbox', { name: 'Owner', exact: true }).fill('Edited owner')
    await editor
      .getByRole('combobox', { name: 'Move selected block to column' })
      .selectOption('column-two')
    await expect(
      editor
        .locator('[data-footer-column="column-two"]')
        .getByRole('button', { name: 'Copyright', exact: true }),
    ).toBeVisible()
    await expect(editor.getByRole('textbox', { name: 'Owner', exact: true })).toHaveValue(
      'Edited owner',
    )
    const handle = editor.getByRole('button', { name: 'Drag Copyright', exact: true })
    const destination = editor.locator('[data-footer-column="column-three"]')
    const start = await handle.boundingBox()
    const end = await destination.boundingBox()
    if (!start || !end) throw new Error('Footer drag targets must be visible')
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
    await page.mouse.down()
    await page.mouse.move(start.x + start.width / 2 + 10, start.y + start.height / 2, { steps: 3 })
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 15 })
    await page.mouse.up()
    await expect(
      editor
        .locator('[data-footer-column="column-three"]')
        .getByRole('button', { name: 'Copyright', exact: true }),
    ).toBeVisible()
    await editor
      .getByRole('combobox', { name: 'Add block to area 1 column 1' })
      .selectOption('newsletter')
    await expect(editor.getByRole('textbox', { name: 'Heading *', exact: true })).toHaveValue(
      'Stay in the loop',
    )
    await editor.getByRole('textbox', { name: 'Heading *', exact: true }).fill('Get updates')
    await editor
      .getByRole('combobox', { name: 'Add block to area 1 column 2' })
      .selectOption('contactForm')
    await expect(editor.getByRole('textbox', { name: 'Heading *', exact: true })).toHaveValue(
      'How can I help?',
    )
    await editor
      .getByRole('combobox', { name: 'Add block to area 1 column 2' })
      .selectOption('text')
    const richText = editor
      .getByRole('complementary', { name: 'Footer component settings' })
      .locator('[contenteditable="true"]')
    await richText.fill('Saved formatted content')
    await richText.press('ControlOrMeta+a')
    await richText.press('ControlOrMeta+b')
    await editor.getByRole('button', { name: 'Move area 2 up' }).click()
    await expect(editor.locator('.footer-editor__area').first()).toHaveAttribute(
      'aria-label',
      'Second area',
    )
    await editor.getByRole('button', { name: 'Mobile layout', exact: true }).click()
    await expect(editor.locator('.footer-editor__board--mobile')).toBeVisible()
    await expect(editor.locator('.footer-editor__columns').last()).toHaveCSS(
      'grid-template-columns',
      /^\d+(\.\d+)?px$/,
    )
    await editor.getByRole('button', { name: 'Desktop layout', exact: true }).click()
    for (let i = 0; i < 4; i++) {
      await editor.getByRole('button', { name: 'Add content area', exact: true }).click()
      await expect(editor.locator('.footer-editor__area')).toHaveCount(i + 3)
    }
    await removal(
      () => editor.getByRole('button', { name: 'Remove area', exact: true }).first().click(),
      false,
      'Remove this content area and all of its blocks?',
    )
    await expect(editor.locator('.footer-editor__area')).toHaveCount(6)
    const lastArea = editor.locator('.footer-editor__area').last()
    await lastArea.getByRole('button', { name: 'Add column', exact: true }).click()
    await expect(lastArea.locator('.footer-editor__column')).toHaveCount(2)
    const secondColumnId = await lastArea
      .locator('[data-footer-column]')
      .nth(1)
      .getAttribute('data-footer-column')
    await editor.getByRole('button', { name: 'Move column 2 left in area 6' }).click()
    await expect(lastArea.locator('[data-footer-column]').first()).toHaveAttribute(
      'data-footer-column',
      secondColumnId!,
    )
    await editor
      .getByRole('combobox', { name: 'Add block to area 6 column 1' })
      .selectOption('logo')
    await expect(
      lastArea
        .locator('.footer-editor__column')
        .first()
        .getByRole('button', { name: 'Logo', exact: true }),
    ).toBeVisible()
    await removal(
      () => editor.getByRole('button', { name: 'Remove column 1 in area 6' }).click(),
      true,
      'Remove this column and all of its blocks?',
    )
    await expect(lastArea.locator('.footer-editor__column')).toHaveCount(1)
    await editor
      .getByRole('combobox', { name: 'Add block to area 6 column 1' })
      .selectOption('logo')
    await expect(
      lastArea
        .locator('.footer-editor__column')
        .first()
        .getByRole('button', { name: 'Logo', exact: true }),
    ).toBeVisible()
    await removal(
      () => lastArea.getByRole('button', { name: 'Remove area', exact: true }).click(),
      true,
      'Remove this content area and all of its blocks?',
    )
    await expect(editor.locator('.footer-editor__area')).toHaveCount(5)
    await editor.getByRole('button', { name: 'Add content area', exact: true }).click()
    await expect(editor.locator('.footer-editor__area')).toHaveCount(6)
    await expect(
      editor.getByRole('button', { name: 'Add content area', exact: true }),
    ).toBeEnabled()
    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/api/globals/footerNavigation'),
    )
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    const response = await saved
    expect(response.status()).toBe(200)
    const result = (await response.json()) as { message: string }
    await expect(page.getByText(result.message, { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled()
    await page.reload()
    await expect(editor.locator('.footer-editor__area')).toHaveCount(6, { timeout: 30_000 })
    await editor.getByRole('button', { name: 'Copyright', exact: true }).click()
    await expect(editor.getByRole('textbox', { name: 'Owner', exact: true })).toHaveValue(
      'Edited owner',
    )
    const payload = await getPayload({ config })
    const footer = await payload.findGlobal({ slug: 'footerNavigation' })
    const persisted =
      footer.contentAreas?.flatMap((a) => a.columns.flatMap((c) => c.blocks ?? [])) ?? []
    expect(persisted.find((b) => b.blockType === 'copyright')?.id).toBe('copyright-one')
    expect(persisted.find((b) => b.blockType === 'newsletter')?.heading).toBe('Get updates')
    expect(JSON.stringify(persisted.find((b) => b.blockType === 'text')?.content)).toContain(
      'Saved formatted content',
    )
  })
})
