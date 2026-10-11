import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HeroSurface } from './HeroSurface.js'

let resize: (() => void) | undefined
const disconnect = vi.fn()
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  disconnect.mockClear()
})

describe('viewport hero spacing', () => {
  it('accounts for padding, borders and header overlap and responds to resizing', () => {
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
    const { container, unmount } = render(
      <div>
        <header className="site-header" style={{ marginBottom: '-80px' }} />
        <main style={{ paddingTop: '24px' }}>
          <div
            className="page-block"
            style={{
              paddingTop: '120px',
              paddingBottom: '40px',
              borderTop: '1px solid',
              marginTop: '8px',
            }}
          >
            <HeroSurface viewport className="page-hero">
              <p>Content</p>
            </HeroSurface>
          </div>
        </main>
      </div>,
    )
    const hero = container.querySelector('section')!
    expect(hero.style.getPropertyValue('--publishing-hero-spacing')).toBe(
      '113px',
    )
    container.querySelector('main')!.style.paddingTop = '0px'
    act(() => resize?.())
    expect(hero.style.getPropertyValue('--publishing-hero-spacing')).toBe(
      '89px',
    )
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
  it('does not measure fixed presets', () => {
    const { container } = render(
      <HeroSurface viewport={false} className="page-hero">
        Content
      </HeroSurface>,
    )
    expect(container.querySelector('section')!.style.length).toBe(0)
  })
  it('omits page top padding and leading header overlap for later heroes without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const { container } = render(
      <div>
        <header className="site-header" style={{ marginBottom: '-80px' }} />
        <main style={{ paddingTop: '24px' }}>
          <div className="page-block">Earlier block</div>
          <div
            className="page-block"
            style={{ paddingTop: '20px', paddingBottom: '30px' }}
          >
            <HeroSurface viewport className="page-hero">
              Content
            </HeroSurface>
          </div>
        </main>
      </div>,
    )
    expect(
      container
        .querySelector('section')!
        .style.getPropertyValue('--publishing-hero-spacing'),
    ).toBe('50px')
  })
})
