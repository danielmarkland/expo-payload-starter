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
  for (const width of [320, 390, 768, 1440])
    for (const count of [1, 2, 3, 4]) {
      await page.setViewportSize({ width, height: 900 })
      await page.setContent(
        `<style>:root{--layout-content:1120px;--space-lg:24px;--space-xl:40px;--space-md:16px;--space-sm:8px;--space-3xl:72px;--space-2xl:48px}${css}</style><main class="page-shell"><div class="page-block">Final CTA</div></main><footer class="site-footer footer-builder"><section class="footer-content-area padding-top-md padding-bottom-md"><div class="footer-content-columns" style="--footer-column-count:${count}">${Array.from({ length: count }, (_, i) => `<div class="footer-content-column"><div class="footer-content-block"><h2>Column ${i + 1}</h2><form class="newsletter-form"><div class="newsletter-fields"><label>First<input></label><label>Last<input></label><label>Email<input></label></div><button class="button">Subscribe</button></form></div></div>`).join('')}</div></section></footer>`,
      )
      const result = await page.evaluate(() => ({
        areaPadding: [
          getComputedStyle(document.querySelector('.footer-content-area'))
            .paddingTop,
          getComputedStyle(document.querySelector('.footer-content-area'))
            .paddingBottom,
        ],
        blockPadding: getComputedStyle(
          document.querySelector('.footer-content-block'),
        ).paddingTop,
        overflow: document.documentElement.scrollWidth > innerWidth,
        offenders: [...document.querySelectorAll('body *')]
          .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
          .map((e) => ({
            tag: e.tagName,
            cls: e.className,
            right: e.getBoundingClientRect().right,
            width: e.getBoundingClientRect().width,
          })),
        gap:
          document.querySelector('footer').getBoundingClientRect().top -
          document.querySelector('main').getBoundingClientRect().bottom,
        columns: [...document.querySelectorAll('.footer-content-column')].map(
          (c) => c.getBoundingClientRect().toJSON(),
        ),
        inputs: [...document.querySelectorAll('input')].map((e) => ({
          right: e.getBoundingClientRect().right,
          colRight: e.closest('.footer-content-column').getBoundingClientRect()
            .right,
        })),
        buttons: [...document.querySelectorAll('button')].map((b) => ({
          width: b.getBoundingClientRect().width,
          colWidth: b.closest('.footer-content-column').getBoundingClientRect()
            .width,
        })),
      }))
      assert.equal(
        result.overflow,
        false,
        `${width}px / ${count} columns must not overflow: ${JSON.stringify(result.offenders)}`,
      )
      assert.deepEqual(
        result.areaPadding,
        ['40px', '40px'],
        'Configured area padding must apply without page-block defaults',
      )
      assert.equal(
        result.blockPadding,
        '0px',
        'Unconfigured blocks must not inherit page-section padding',
      )
      assert.equal(result.gap, 0)
      if (width <= 700)
        for (let i = 1; i < result.columns.length; i++)
          assert.ok(result.columns[i].y > result.columns[i - 1].y)
      else
        for (const col of result.columns)
          assert.ok(Math.abs(col.width - result.columns[0].width) < 1)
      for (const input of result.inputs)
        assert.ok(input.right <= input.colRight + 1)
      for (const button of result.buttons)
        assert.ok(button.width <= Math.min(192, button.colWidth) + 1)
    }
  // Exercise all four spacing sides and surfaces on both appearance owners.
  for (const owner of ['footer-content-area', 'footer-content-block']) {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.setContent(
        `<style>:root{--space-md:16px;--space-xl:40px;--space-3xl:72px;--space-5xl:120px;--color-border:rgb(1,2,3);--color-primary:rgb(4,5,6);--color-primary-ink:white}${css}</style><footer class="site-footer footer-builder"><div class="${owner} padding-top-lg padding-right-sm padding-bottom-xl padding-left-md margin-top-sm margin-right-sm margin-bottom-md margin-left-sm background-accent border-top-accent border-right-default border-bottom-default border-left-default border-width-medium"><p>Configured content</p></div></footer>`,
      )
      const style = await page.locator(`.${owner}`).evaluate((element) => {
        const s = getComputedStyle(element)
        return {
          padding: [
            s.paddingTop,
            s.paddingRight,
            s.paddingBottom,
            s.paddingLeft,
          ],
          margin: [s.marginTop, s.marginRight, s.marginBottom, s.marginLeft],
          background: s.backgroundColor,
          color: s.color,
          border: [
            s.borderTopWidth,
            s.borderRightWidth,
            s.borderBottomWidth,
            s.borderLeftWidth,
          ],
          borderStyle: s.borderTopStyle,
        }
      })
      assert.deepEqual(
        style.padding,
        ['72px', '16px', '120px', '40px'],
        `${owner} / ${width}px padding`,
      )
      assert.deepEqual(style.margin, ['16px', '16px', '40px', '16px'])
      assert.equal(style.background, 'rgb(4, 5, 6)')
      assert.equal(style.color, 'rgb(255, 255, 255)')
      assert.deepEqual(style.border, ['2px', '2px', '2px', '2px'])
      assert.equal(style.borderStyle, 'solid')
    }
  }
  console.log(
    'Passed 16 responsive footer column/form layouts, mobile order, equal widths, and page/footer adjacency.',
  )
} finally {
  await browser.close()
}
