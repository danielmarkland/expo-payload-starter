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
const logo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="13397" height="728" viewBox="0 0 13397 728"><rect width="13397" height="728" fill="black"/></svg>')}`
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.setContent(
      `<style>:root{--space-lg:24px;--space-md:16px;--font-size-body:16px;--font-size-small:14px;--layout-content:1120px}${css}</style><header class="site-header"><a class="site-brand" style="--site-logo-max-width:320px;--site-logo-max-height:56px"><img class="site-brand-logo" src="${logo}"></a><nav class="header-navigation"><a class="header-navigation-accent button button-primary-filled">Sell your records</a></nav></header><main><a class="button">Start a submission</a><button class="button">Continue</button></main>`,
    )
    await page.locator('img').evaluate((img) => img.decode())
    const dimensions = await page.evaluate(() => ({
      buttons: [...document.querySelectorAll('.button')].map((b) => ({
        width: b.getBoundingClientRect().width,
        height: b.getBoundingClientRect().height,
      })),
      logo: document.querySelector('img').getBoundingClientRect().toJSON(),
      overflow: document.documentElement.scrollWidth > innerWidth,
    }))
    assert.deepEqual(
      dimensions.buttons,
      Array(3).fill({ width: 192, height: 50 }),
      `Standard buttons at ${width}px`,
    )
    assert.equal(dimensions.overflow, false)
    assert.ok(
      dimensions.logo.width > 0 &&
        dimensions.logo.width <= 320.1 &&
        dimensions.logo.right <= width,
      JSON.stringify({ width, ...dimensions }),
    )
    assert.ok(
      Math.abs(dimensions.logo.width / dimensions.logo.height - 13397 / 728) <
        0.1,
    )
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.setContent(
      `<style>:root{--space-lg:24px;--space-md:16px;--space-2xl:48px;--font-size-body:16px}${css}</style><main style="padding:24px"><section class="contact-section"><div class="section-heading">Contact us</div><form class="contact-form"><label>Name<input></label><label>Email<input type="email"></label><label>Message<textarea></textarea></label><button class="button">Send message</button></form></section><section class="split-content"><div class="split-content-copy">Our approach</div><div class="split-content-image">Illustration</div></section></main>`,
    )
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      button: {
        width: document.querySelector('button').getBoundingClientRect().width,
        height: document.querySelector('button').getBoundingClientRect().height,
      },
      contact: [...document.querySelector('.contact-section').children].map(
        (e) => e.getBoundingClientRect().toJSON(),
      ),
      split: [...document.querySelector('.split-content').children].map((e) =>
        e.getBoundingClientRect().toJSON(),
      ),
    }))
    assert.equal(
      result.overflow,
      false,
      `Page contact and split sections at ${width}px`,
    )
    assert.deepEqual(result.button, { width: 192, height: 50 })
    if (width <= 520) {
      assert.ok(result.contact[1].top >= result.contact[0].bottom)
      assert.ok(result.split[1].top >= result.split[0].bottom)
    }
  }
  console.log(
    'Passed responsive logo bounds and consistent header, CTA, and contact button sizing; mobile contact/split stacking.',
  )
} finally {
  await browser.close()
}
