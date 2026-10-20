import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const css = (
  await Promise.all(
    ['base', 'layout'].map((name) =>
      readFile(new URL(`../src/${name}.css`, import.meta.url), 'utf8'),
    ),
  )
).join('\n')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.setContent(`<style>:root{--space-lg:24px;--space-xl:40px;--space-2xl:48px;--space-3xl:72px;--space-4xl:96px;--color-border:#ddd;--layout-content:1120px}${css}</style>
      <main class="page-shell page-width-site"><div class="page-block padding-top-md padding-bottom-md background-accent"><section><h2>Ready to begin?</h2><p>Final section</p></section></div></main>
      <footer class="site-footer">Footer content</footer>`)
    const result = await page.evaluate(() => {
      const lastBlock = document.querySelector('.page-block')
      const footer = document.querySelector('.site-footer')
      return {
        gap:
          footer.getBoundingClientRect().top -
          lastBlock.getBoundingClientRect().bottom,
        sectionPadding: getComputedStyle(lastBlock).paddingBottom,
        footerPadding: getComputedStyle(footer).paddingTop,
      }
    })
    assert.equal(result.gap, 0, `No blank band at ${width}px`)
    assert.equal(result.sectionPadding, '40px')
    assert.equal(result.footerPadding, width <= 520 ? '48px' : '72px')
    await page.setContent(
      `<style>:root{--space-2xl:48px;--space-3xl:72px}${css}</style><main class="article-container">Article</main><footer class="site-footer">Footer</footer>`,
    )
    assert.equal(
      await page
        .locator('.site-footer')
        .evaluate((element) => getComputedStyle(element).marginTop),
      width <= 520 ? '48px' : '72px',
    )
  }
  console.log(
    'Passed responsive page/footer adjacency and preserved section, footer, and article spacing.',
  )
} finally {
  await browser.close()
}
