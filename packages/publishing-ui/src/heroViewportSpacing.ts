/** Read actual spacing, including the negative margin used by overlay headers. */
export function measureHeroSpacing(hero: HTMLElement): void {
  const block = hero.parentElement
  const main = block?.parentElement
  if (!block || !main) return
  const header = main.parentElement?.querySelector<HTMLElement>('.site-header')
  const pixels = (value: string) => Number.parseFloat(value) || 0
  const blockStyle = getComputedStyle(block)
  const mainStyle = getComputedStyle(main)
  const headerStyle = header ? getComputedStyle(header) : null
  const leading = main.querySelector('.page-block') === block
  const spacing =
    pixels(blockStyle.paddingTop) +
    pixels(blockStyle.paddingBottom) +
    pixels(blockStyle.borderTopWidth) +
    pixels(blockStyle.borderBottomWidth) +
    pixels(blockStyle.marginTop) +
    (leading ? pixels(mainStyle.paddingTop) : 0) +
    (leading && headerStyle ? pixels(headerStyle.marginBottom) : 0)
  hero.style.setProperty('--publishing-hero-spacing', `${spacing}px`)
}
