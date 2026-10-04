import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { NewsletterForm } from '@/components/NewsletterForm'
import { SiteConfigProvider } from '@/components/SiteConfigProvider'

vi.mock('next/script', () => ({ default: () => null }))

function renderForm(siteKey: null | string = 'site-key') {
  return render(
    <SiteConfigProvider
      config={
        { integrations: { googleTagManagerId: null, turnstileSiteKey: siteKey } } as SiteConfig
      }
    >
      <NewsletterForm
        consentText="Consent text"
        submitLabel="Subscribe"
        successMessage="Subscribed."
      />
    </SiteConfigProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('newsletter form', () => {
  it('submits all required fields and announces success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))
    renderForm()
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Ada' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Lovelace' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } })
    const form = screen.getByRole('button', { name: 'Subscribe' }).closest('form')!
    const token = document.createElement('input')
    token.name = 'cf-turnstile-response'
    token.value = 'verified-token'
    form.append(token)
    fireEvent.submit(form)

    await waitFor(() => expect(screen.getByText('Subscribed.')).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/newsletter',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('disables signup when Turnstile is not configured', () => {
    renderForm(null)
    expect((screen.getByRole('button', { name: 'Subscribe' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    expect(screen.getByRole('alert').textContent).toContain('not configured')
  })
})
