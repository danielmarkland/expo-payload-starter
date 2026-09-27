import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ContactForm } from '@/components/ContactForm'

vi.mock('next/script', () => ({ default: () => null }))

describe('contact form', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'turnstile-site-key')
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('submits validated form data and announces success', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    render(<ContactForm submitLabel="Send message" successMessage="Message received." />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Daniel Markland' } })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'daniel@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'I would like to discuss a project.' },
    })
    const form = screen.getByRole('button', { name: 'Send message' }).closest('form')
    const token = document.createElement('input')
    token.name = 'cf-turnstile-response'
    token.value = 'verified-token'
    form?.append(token)
    fireEvent.submit(form!)

    await waitFor(() => expect(screen.getByText('Message received.')).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('disables submission when Turnstile is not configured', () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
    render(<ContactForm submitLabel="Send message" successMessage="Message received." />)

    expect(
      (screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(screen.getByRole('alert').textContent).toContain('not configured')
  })
})
