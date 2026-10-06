import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { usePublishingFormSubmission } from './usePublishingFormSubmission.js'
function Fixture({ siteKey = 'site-key' }: { siteKey?: string }) {
  const { status, turnstileKey, submit } = usePublishingFormSubmission({
    endpoint: '/api/v1/contact',
    siteKey,
    fields: (data) => ({ email: data.get('email') }),
  })
  return (
    <form aria-label="submission" onSubmit={submit}>
      <input name="email" defaultValue="reader@example.com" />
      <input
        type="hidden"
        name="cf-turnstile-response"
        defaultValue="captcha"
      />
      <input type="hidden" name="website" defaultValue="" />
      <span>
        {status}:{turnstileKey}
      </span>
    </form>
  )
}
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
describe('shared form lifecycle', () => {
  it('prevents duplicate in-flight submissions, preserves captcha fields and resets successful forms', async () => {
    let complete!: (response: Response) => void
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve
        }),
    )
    vi.stubGlobal('fetch', fetcher)
    render(<Fixture />)
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      email: 'reader@example.com',
      turnstileToken: 'captcha',
      website: '',
    })
    await act(async () => {
      complete(Response.json({ ok: true }))
    })
    await waitFor(() => expect(screen.getByText('success:1')).toBeTruthy())
  })
  it('refreshes the challenge after failure, allows retry, and keeps entered fields', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(Response.json({ ok: true }))
    vi.stubGlobal('fetch', fetcher)
    render(<Fixture />)
    const form = screen.getByRole('form')
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'changed@example.com' } })
    await act(async () => {
      fireEvent.submit(form)
    })
    await waitFor(() => expect(screen.getByText('error:1')).toBeTruthy())
    expect(input.value).toBe('changed@example.com')
    await act(async () => {
      fireEvent.submit(form)
    })
    await waitFor(() => expect(screen.getByText('success:2')).toBeTruthy())
    expect(input.value).toBe('reader@example.com')
  })
  it('does not submit without a configured captcha key', () => {
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    render(<Fixture siteKey="" />)
    fireEvent.submit(screen.getByRole('form'))
    expect(fetcher).not.toHaveBeenCalled()
    expect(screen.getByText('idle:0')).toBeTruthy()
  })
})
