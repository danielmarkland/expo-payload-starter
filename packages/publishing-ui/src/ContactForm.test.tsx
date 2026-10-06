import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { createContactForm } from './ContactForm.js'
import { ArrowRight } from 'lucide-react'
import { createLinkComponents } from './LinkAction.js'
const { LinkLabel } = createLinkComponents((icon) =>
  icon === 'arrow-right' ? ArrowRight : undefined,
)
const ContactForm = createContactForm({ LinkLabel })
import { SiteConfigProvider } from './SiteConfigProvider.js'

vi.mock('next/script', () => ({ default: () => null }))

function renderForm(
  props: ComponentProps<typeof ContactForm> = {
    submitLabel: 'Send message',
    successMessage: 'Message received.',
  },
  siteKey: null | string = 'turnstile-site-key',
) {
  const config = {
    integrations: { googleTagManagerId: null, turnstileSiteKey: siteKey },
  } as SiteConfig
  return render(
    <SiteConfigProvider config={config}>
      <ContactForm {...props} />
    </SiteConfigProvider>,
  )
}

describe('contact form', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('submits validated form data and announces success', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      )
    renderForm()

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Daniel Markland' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'daniel@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'I would like to discuss a project.' },
    })
    const form = screen
      .getByRole('button', { name: 'Send message' })
      .closest('form')
    const token = document.createElement('input')
    token.name = 'cf-turnstile-response'
    token.value = 'verified-token'
    form?.append(token)
    fireEvent.submit(form!)

    await waitFor(() =>
      expect(screen.getByText('Message received.')).toBeTruthy(),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/contact',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('submits separate booking names and company without a combined name', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      )
    renderForm({
      submitLabel: 'Send',
      successMessage: 'Received',
      nameMode: 'separate',
      showCompany: true,
    })
    for (const [label, value] of [
      ['First name', 'Daniel'],
      ['Last name', 'Markland'],
      ['Company', 'Code Assassins'],
      ['Email', 'daniel@example.com'],
      ['Message', 'Please book a date.'],
    ])
      fireEvent.change(screen.getByLabelText(label), { target: { value } })
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')!
    const token = document.createElement('input')
    token.name = 'cf-turnstile-response'
    token.value = 'verified-token'
    form.append(token)
    fireEvent.submit(form)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
    expect(body).toMatchObject({
      firstName: 'Daniel',
      lastName: 'Markland',
      company: 'Code Assassins',
    })
    expect(body).not.toHaveProperty('name')
  })

  it('disables submission when Turnstile is not configured', () => {
    renderForm(undefined, null)

    expect(
      (
        screen.getByRole('button', {
          name: 'Send message',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
    expect(screen.getByRole('alert').textContent).toContain('not configured')
  })

  it('uses the selected submit variant and defaults to primary filled', () => {
    const { rerender } = renderForm({
      submitButtonVariant: 'secondary-outline',
      submitLabel: 'Send message',
      successMessage: 'Message received.',
    })

    expect(screen.getByRole('button', { name: 'Send message' }).className).toBe(
      'button button-secondary-outline',
    )

    rerender(
      <SiteConfigProvider
        config={
          {
            integrations: { googleTagManagerId: null, turnstileSiteKey: 'key' },
          } as SiteConfig
        }
      >
        <ContactForm
          submitLabel="Send message"
          successMessage="Message received."
        />
      </SiteConfigProvider>,
    )
    expect(screen.getByRole('button', { name: 'Send message' }).className).toBe(
      'button button-primary-filled',
    )

    rerender(
      <SiteConfigProvider
        config={
          {
            integrations: { googleTagManagerId: null, turnstileSiteKey: 'key' },
          } as SiteConfig
        }
      >
        <ContactForm
          submitButtonVariant={'unsupported' as never}
          submitLabel="Send message"
          successMessage="Message received."
        />
      </SiteConfigProvider>,
    )
    expect(screen.getByRole('button', { name: 'Send message' }).className).toBe(
      'button button-primary-filled',
    )
  })

  it('renders a configured submit icon after the label', () => {
    renderForm({
      submitIcon: 'arrow-right',
      submitIconPosition: 'right',
      submitLabel: 'Send message',
      successMessage: 'Message received.',
    })

    const button = screen.getByRole('button', { name: 'Send message' })
    expect(button.querySelector('.lucide-arrow-right')).toBeTruthy()
    expect(button.lastElementChild?.classList.contains('link-icon')).toBe(true)
  })
})
