import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HeaderSurface } from './HeaderSurface.js'

let resize: (() => void) | undefined
const disconnect = vi.fn()
vi.stubGlobal(
  'ResizeObserver',
  class {
    constructor(callback: () => void) {
      resize = callback
    }
    observe() {}
    disconnect = disconnect
  },
)
afterEach(() => {
  cleanup()
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  vi.restoreAllMocks()
  disconnect.mockClear()
})
function scroll(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  act(() => window.dispatchEvent(new Event('scroll')))
}
describe('header surfaces', () => {
  for (const top of ['fill', 'transparent'] as const) {
    for (const scrolled of ['fill', 'transparent'] as const) {
      it(`switches ${top} to ${scrolled} after 8px and restores the top`, () => {
        const { container } = render(
          <HeaderSurface topBackground={top} scrolledBackground={scrolled}>
            <nav>Links</nav>
          </HeaderSurface>,
        )
        const header = container.querySelector('header')!
        expect(header.dataset.headerBackground).toBe(top)
        scroll(8)
        expect(header.dataset.headerState).toBe('top')
        scroll(9)
        expect(header.dataset.headerBackground).toBe(scrolled)
        expect(header.dataset.headerState).toBe('scrolled')
        scroll(0)
        expect(header.dataset.headerBackground).toBe(top)
      })
    }
  }
  it('defaults missing/null settings to fill and keeps sticky independent', () => {
    const { container, rerender } = render(
      <HeaderSurface sticky topBackground={null}>
        <span>Brand</span>
      </HeaderSurface>,
    )
    const header = container.querySelector('header')!
    expect(header.dataset.headerBackground).toBe('fill')
    expect(header.classList.contains('site-header-sticky')).toBe(true)
    scroll(20)
    expect(header.dataset.headerBackground).toBe('fill')
    rerender(
      <HeaderSurface>
        <span>Brand</span>
      </HeaderSurface>,
    )
    expect(header.classList.contains('site-header-sticky')).toBe(false)
  })
  it('initializes restored scroll, measures resized navigation and cleans up', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 })
    let height = 80
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ height }) as DOMRect,
    )
    const remove = vi.spyOn(window, 'removeEventListener')
    const { container, unmount } = render(
      <HeaderSurface topBackground="transparent" scrolledBackground="fill">
        <span>Brand</span>
      </HeaderSurface>,
    )
    expect(container.querySelector('header')!.dataset.headerBackground).toBe(
      'fill',
    )
    expect(container.style.getPropertyValue('--publishing-header-height')).toBe(
      '80px',
    )
    height = 120
    act(() => resize?.())
    expect(container.style.getPropertyValue('--publishing-header-height')).toBe(
      '120px',
    )
    unmount()
    expect(container.style.getPropertyValue('--publishing-header-height')).toBe(
      '',
    )
    expect(disconnect).toHaveBeenCalled()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('pageshow', expect.any(Function))
  })
})
