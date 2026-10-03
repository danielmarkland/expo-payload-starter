import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('next/script', () => ({
  default: ({ onReady }: { onReady: () => void }) => (
    <button onClick={onReady}>Load CAPTCHA</button>
  ),
}))
import { TurnstileField } from './TurnstileField.js'
afterEach(() => {
  cleanup()
  delete window.turnstile
})
describe('public CAPTCHA widget', () => {
  it('uses the supplied public key and action, avoids duplicate widgets, and cleans up', () => {
    const api = { render: vi.fn().mockReturnValue('widget-1'), remove: vi.fn() }
    window.turnstile = api
    const { rerender, unmount } = render(
      <TurnstileField siteKey="public-key" action="contact" />,
    )
    expect(api.render).toHaveBeenCalledWith(expect.any(HTMLElement), {
      sitekey: 'public-key',
      action: 'contact',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load CAPTCHA' }))
    expect(api.render).toHaveBeenCalledTimes(1)
    rerender(<TurnstileField siteKey="another-key" action="newsletter" />)
    expect(api.remove).toHaveBeenCalledWith('widget-1')
    expect(api.render).toHaveBeenLastCalledWith(expect.any(HTMLElement), {
      sitekey: 'another-key',
      action: 'newsletter',
    })
    unmount()
    expect(api.remove).toHaveBeenCalledTimes(2)
  })
  it('waits for the script to load when the API is not yet available', () => {
    render(<TurnstileField siteKey="public-key" action="contact" />)
    const api = { render: vi.fn().mockReturnValue('widget-1'), remove: vi.fn() }
    window.turnstile = api
    fireEvent.click(screen.getByRole('button', { name: 'Load CAPTCHA' }))
    expect(api.render).toHaveBeenCalledTimes(1)
  })
})
