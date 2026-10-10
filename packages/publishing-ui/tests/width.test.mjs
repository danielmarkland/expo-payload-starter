import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const css = await Promise.all(
  ['base', 'layout'].map((name) =>
    readFile(new URL(`../src/${name}.css`, import.meta.url), 'utf8'),
  ),
)
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  for (const viewport of [375, 768, 1440, 1920]) {
    await page.setViewportSize({ width: viewport, height: 900 })
    for (const site of ['full', 'padded'])
      for (const width of ['site', 'full', 'padded']) {
        await page.setContent(`<style>:root{--layout-content:1120px;--layout-copy:720px;--layout-gutter:24px;--space-lg:24px;--site-section-gutter:${site === 'full' ? '0px' : 'var(--padded-section-gutter)'}}${css.join('\n')}</style>
        <header class="site-header"><span id="brand">Brand</span></header>
        <main class="page-shell page-width-${width}">${['page', 'full', 'padded'].map((block) => `<div class="page-block section-width-${block}"><section class="page-section"><header class="section-heading"><h2 id="${block}">Heading</h2></header><div class="article-body"><p>Paragraph reading measure</p></div></section></div>`).join('')}</main>
        <footer class="site-footer"><div id="footer">Footer</div></footer>`)
        const padded = Math.max(
          Math.min(24, Math.max(16, viewport * 0.03)),
          (viewport - 1120) / 2,
        )
        const measurements = await page.evaluate(() =>
          Object.fromEntries(
            ['brand', 'footer', 'page', 'full', 'padded'].map((id) => {
              const rect = document.getElementById(id).getBoundingClientRect()
              return [id, { left: rect.left, right: rect.right }]
            }),
          ),
        )
        for (const id of ['brand', 'footer'])
          assert.ok(
            Math.abs(measurements[id].left - (site === 'full' ? 0 : padded)) <=
              1.1,
            JSON.stringify({ viewport, site, width, id, measurements }),
          )
        for (const id of ['page', 'full', 'padded']) {
          const resolved =
            id === 'page' ? (width === 'site' ? site : width) : id
          const gutter = resolved === 'full' ? 0 : padded
          assert.ok(
            Math.abs(measurements[id].left - gutter) <= 1,
            JSON.stringify({ viewport, site, width, id, measurements }),
          )
          assert.ok(
            Math.abs(measurements[id].right - (viewport - gutter)) <= 1,
            JSON.stringify({ viewport, site, width, id, measurements }),
          )
        }
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth),
          viewport,
        )
      }
  }
  console.log(
    'Passed 24 responsive site/page scenarios with both block overrides and header/footer alignment.',
  )
} finally {
  await browser.close()
}
