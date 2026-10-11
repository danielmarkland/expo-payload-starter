import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { measureHeroSpacing } from '../src/heroViewportSpacing.ts'

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
  for (const width of [375, 768, 1440])
    for (const variant of ['text', 'background', 'split'])
      for (const alignment of ['top', 'middle', 'bottom'])
        for (const sticky of [false, true])
          for (const minimal of [false, true])
            for (const padding of ['none', 'xl']) {
              await page.setViewportSize({ width, height: 900 })
              const overlay = variant === 'background'
              await page.setContent(`<style>:root{--layout-content:1120px;--layout-hero:800px;--layout-copy:700px;--layout-gutter:24px;--space-sm:8px;--space-md:16px;--space-lg:24px;--space-xl:32px;--space-2xl:48px;--space-3xl:64px;--space-4xl:80px;--space-5xl:96px;--color-border:#333;--color-surface:#fff;--color-ink:#111}${css}</style>
              <header class="site-header${sticky ? ' site-header-sticky' : ''}" data-header-default="${minimal ? 'minimal' : 'standard'}" data-header-top-background="${overlay ? 'transparent' : 'fill'}" data-header-background="fill"><span>Brand</span><nav class="header-navigation">${'Navigation link '.repeat(12)}</nav></header>
              <main class="page-shell page-width-site" data-leading-background-hero="${overlay}"><div class="page-block page-block-hero${overlay ? ' page-block-background-hero' : ''} padding-top-${padding} padding-bottom-${padding}"><section class="page-hero hero-height-viewport hero-vertical-${alignment} hero-variant-${variant}${variant !== 'split' ? ' page-hero-without-image' : ''}"><div class="page-hero-copy"><h1>Hero</h1><p>Body copy</p><div class="actions"><a href="#">Action</a></div></div>${variant === 'split' ? '<img class="page-hero-image" width="300" height="100" alt="Artwork" />' : ''}</section></div><div class="page-block">Next section</div></main>`)
              await page.evaluate(
                `window.measureHeroSpacing = ${measureHeroSpacing.toString()}; window.measure = () => { document.body.style.setProperty('--publishing-header-height', document.querySelector('.site-header').getBoundingClientRect().height + 'px'); window.measureHeroSpacing(document.querySelector('.page-hero')); }; window.measure();`,
              )
              const check = async () => {
                const result = await page.evaluate(() => {
                  const hero = document.querySelector('.page-hero')
                  const copy = document.querySelector('.page-hero-copy')
                  const wrapper = hero.parentElement
                  return {
                    bottom: wrapper.getBoundingClientRect().bottom,
                    heroTop: hero.getBoundingClientRect().top,
                    heroHeight: hero.getBoundingClientRect().height,
                    copyTop: copy.getBoundingClientRect().top,
                    copyHeight: copy.getBoundingClientRect().height,
                    alignment: getComputedStyle(copy).alignSelf,
                    copyBottom: copy.getBoundingClientRect().bottom,
                    heroBottom: hero.getBoundingClientRect().bottom,
                    scrollWidth: document.documentElement.scrollWidth,
                    width: innerWidth,
                  }
                })
                assert.ok(
                  Math.abs(result.bottom - 900) < 2,
                  JSON.stringify({
                    width,
                    variant,
                    alignment,
                    sticky,
                    minimal,
                    padding,
                    ...result,
                  }),
                )
                assert.equal(
                  result.alignment,
                  { top: 'start', middle: 'center', bottom: 'end' }[alignment],
                )
                if (variant !== 'split' || width >= 768) {
                  const expectedTop =
                    alignment === 'top'
                      ? result.heroTop
                      : alignment === 'bottom'
                        ? result.heroBottom - result.copyHeight
                        : result.heroTop +
                          (result.heroHeight - result.copyHeight) / 2
                  assert.ok(Math.abs(result.copyTop - expectedTop) < 2)
                }
                assert.ok(result.copyBottom <= result.heroBottom + 1)
                assert.ok(result.scrollWidth <= result.width + 1)
              }
              await check()
              await page.setViewportSize({ width: width + 70, height: 900 })
              await page.evaluate(() => window.measure())
              await check()
              await page.evaluate(() => {
                document.querySelector('.page-hero-copy').style.height =
                  '1200px'
                window.measure()
              })
              assert.ok(
                await page.evaluate(
                  () =>
                    document.querySelector('.page-hero').getBoundingClientRect()
                      .height >= 1200,
                ),
              )
            }
  console.log(
    'Viewport heroes: variants, alignment, wrapping/minimal/sticky headers, overlay, padding, resize and long content passed',
  )
} finally {
  await browser.close()
}
