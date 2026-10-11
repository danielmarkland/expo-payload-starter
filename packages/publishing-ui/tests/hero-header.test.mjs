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
  const artwork =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#24465a"/><circle cx="1100" cy="300" r="240" fill="#59879a"/></svg>',
    )
  for (const viewport of [375, 768, 1440, 1920]) {
    await page.setViewportSize({ width: viewport, height: 900 })
    for (const sticky of [false, true])
      for (const top of ['fill', 'transparent'])
        for (const scrolled of ['fill', 'transparent']) {
          await page.setContent(`<style>:root{--layout-content:1120px;--layout-hero:1000px;--layout-copy:720px;--layout-gutter:24px;--space-sm:8px;--space-md:16px;--space-lg:24px;--space-xl:32px;--space-2xl:48px;--space-3xl:64px;--space-4xl:80px;--color-surface:#101010;--color-ink:#fff;--color-ink-body:#fff;--color-border:#333;--font-size-hero-min:40px;--font-size-hero-max:80px;--font-family-sans:Arial}${css}</style>
      <header class="site-header${sticky ? ' site-header-sticky' : ''}" data-header-top-background="${top}" data-header-background="${top}"><span>Brand</span><nav class="header-navigation"><a>Music</a><a>About</a><a>Booking</a></nav></header>
      <main class="page-shell page-width-site" data-leading-background-hero="true"><div class="page-block page-block-background-hero section-width-page" style='background-image:linear-gradient(#0006,#0006),url("${artwork}");background-position:25% 75%'><section class="page-hero hero-variant-background page-hero-without-image"><div class="page-hero-copy"><h1>Mostly House. Sometimes Funk.</h1></div></section></div><div class="page-block section-width-page"><section class="page-section"><h2>The next section</h2><p>Content</p></section></div></main><div style="height:1200px"></div>`)
          await page.evaluate(() => window.scrollTo(0, 0))
          await page.waitForFunction(() => window.scrollY === 0)
          await page.evaluate(() =>
            document.body.style.setProperty(
              '--publishing-header-height',
              `${document.querySelector('.site-header').getBoundingClientRect().height}px`,
            ),
          )
          const initial = await page.evaluate(() => {
            const hero = document.querySelector('.page-block-background-hero')
            const header = document.querySelector('.site-header')
            const rect = hero.getBoundingClientRect()
            return {
              heroTop: rect.top,
              left: rect.left,
              right: rect.right,
              copyTop: document
                .querySelector('.page-hero-copy')
                .getBoundingClientRect().top,
              headerBottom: header.getBoundingClientRect().bottom,
              height: rect.height,
              backdrop: getComputedStyle(header).backdropFilter,
              background: getComputedStyle(header).backgroundColor,
              scrollWidth: document.documentElement.scrollWidth,
            }
          })
          assert.equal(initial.left, 0)
          assert.equal(initial.right, viewport)
          assert.equal(initial.scrollWidth, viewport)
          assert.ok(
            Math.abs(
              initial.heroTop -
                (top === 'transparent' ? 0 : initial.headerBottom),
            ) < 1,
            JSON.stringify({ viewport, sticky, top, scrolled, initial }),
          )
          assert.ok(initial.copyTop >= initial.headerBottom)
          assert.equal(initial.backdrop, 'none')
          assert.equal(
            initial.background,
            top === 'transparent' ? 'rgba(0, 0, 0, 0)' : 'rgb(16, 16, 16)',
          )
          await page.evaluate((background) => {
            window.scrollTo(0, 160)
            document.querySelector('.site-header').dataset.headerBackground =
              background
          }, scrolled)
          await page.waitForFunction(() => window.scrollY === 160)
          const after = await page.evaluate(() => ({
            headerTop: document
              .querySelector('.site-header')
              .getBoundingClientRect().top,
            heroHeight: document
              .querySelector('.page-block-background-hero')
              .getBoundingClientRect().height,
            background: getComputedStyle(document.querySelector('.site-header'))
              .backgroundColor,
          }))
          assert.equal(after.heroHeight, initial.height)
          assert.equal(after.headerTop, sticky ? 0 : -160)
          assert.equal(
            after.background,
            scrolled === 'transparent' ? 'rgba(0, 0, 0, 0)' : 'rgb(16, 16, 16)',
          )
          if (
            sticky &&
            top === 'transparent' &&
            scrolled === 'fill' &&
            [375, 1440].includes(viewport)
          ) {
            await page.evaluate(() => {
              window.scrollTo(0, 0)
              document.querySelector('.site-header').dataset.headerBackground =
                'transparent'
            })
            await page.waitForFunction(() => window.scrollY === 0)
            await page.screenshot({
              path: `/private/tmp/hero-header-${viewport}.png`,
            })
          }
        }
    // No hero: transparency does not pull the following page under the header.
    await page.setContent(
      `<style>${css}</style><header class="site-header" data-header-top-background="transparent"><span>Brand</span></header><main class="page-shell"><h1>Text page</h1></main>`,
    )
    assert.equal(
      await page.$eval(
        '.site-header',
        (el) => getComputedStyle(el).marginBottom,
      ),
      '0px',
    )
  }
  console.log(
    'Passed 32 responsive header combinations, hero coverage, sticky geometry and non-hero spacing.',
  )
} finally {
  await browser.close()
}
