import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { createNewsletterForm } from './NewsletterForm.js'
import { ArrowRight } from 'lucide-react'
import { createLinkComponents } from './LinkAction.js'
const { LinkLabel } = createLinkComponents((icon) =>
  icon === 'arrow-right' ? ArrowRight : undefined,
)
const getDestinations = vi.fn(async () => ({
  destinations: [{ id: 'readers', isDefault: true }],
}))
const subscribe = vi.fn(async (submission: Record<string, unknown>) => {
  const response = await fetch('/api/v1/newsletter', {
    method: 'POST',
    body: JSON.stringify(submission),
  })
  if (!response.ok) throw new Error('Failed')
})
const NewsletterForm = createNewsletterForm({
  LinkLabel,
  getDestinations,
  subscribe,
})
import { SiteConfigProvider } from './SiteConfigProvider.js'

vi.mock('next/script', () => ({ default: () => null }))

function renderForm(siteKey: null | string = 'site-key') {
  return render(
    <SiteConfigProvider
      config={
        {
          integrations: { googleTagManagerId: null, turnstileSiteKey: siteKey },
        } as SiteConfig
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
  getDestinations.mockResolvedValue({
    destinations: [{ id: 'readers', isDefault: true }],
  })
})

describe('newsletter form', () => {
  it('submits all required fields and announces success', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}'))
    renderForm()
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Subscribe' }) as HTMLButtonElement)
          .disabled,
      ).toBe(false),
    )
    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: 'Ada' },
    })
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: 'Lovelace' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    })
    const form = screen
      .getByRole('button', { name: 'Subscribe' })
      .closest('form')!
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
    expect(
      (screen.getByRole('button', { name: 'Subscribe' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(screen.getByRole('alert').textContent).toContain('not configured')
  })
  it('keeps an unavailable destination disabled and prevents direct form submission', async () => {
    getDestinations.mockResolvedValueOnce({ destinations: [] })
    subscribe.mockClear()
    renderForm()
    await waitFor(() =>
      expect(
        screen.getByText('Newsletter signup is temporarily unavailable.'),
      ).toBeTruthy(),
    )
    fireEvent.submit(
      screen.getByRole('button', { name: 'Subscribe' }).closest('form')!,
    )
    expect(subscribe).not.toHaveBeenCalled()
  })
  it('passes an explicit destination to the injected SDK operation', async () => {
    render(
      <SiteConfigProvider
        config={
          { integrations: { turnstileSiteKey: 'site-key' } } as SiteConfig
        }
      >
        <NewsletterForm
          destinationId="readers"
          submitLabel="Join"
          successMessage="Joined"
        />
      </SiteConfigProvider>,
    )
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Join' }) as HTMLButtonElement)
          .disabled,
      ).toBe(false),
    )
    fireEvent.submit(
      screen.getByRole('button', { name: 'Join' }).closest('form')!,
    )
    await waitFor(() =>
      expect(subscribe).toHaveBeenCalledWith(
        expect.objectContaining({ destinationId: 'readers' }),
      ),
    )
  })
})
