'use client'

import { type FormEvent, useState } from 'react'

import { buttonClassName, type ButtonVariant } from '@danielmarkland/publishing-core/buttonVariants'
import { LinkLabel } from '@/components/LinkAction'
import { useSiteConfig } from '@/components/SiteConfigProvider'
import { TurnstileField } from '@/components/TurnstileField'

type FormStatus = 'error' | 'idle' | 'sending' | 'success'

export function NewsletterForm({
  buttonVariant,
  consentText,
  submitLabel,
  submitIcon,
  submitIconPosition,
  successMessage,
}: {
  buttonVariant?: ButtonVariant | null
  consentText?: null | string
  submitLabel: string
  submitIcon?: null | string
  submitIconPosition?: 'left' | 'right' | null
  successMessage: string
}) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [turnstileKey, setTurnstileKey] = useState(0)
  const siteKey = useSiteConfig().integrations.turnstileSiteKey

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending' || !siteKey) return
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus('sending')

    try {
      const response = await fetch('/api/v1/newsletter', {
        body: JSON.stringify({
          email: data.get('email'),
          firstName: data.get('firstName'),
          lastName: data.get('lastName'),
          turnstileToken: data.get('cf-turnstile-response'),
          website: data.get('website'),
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Newsletter request failed')
      form.reset()
      setTurnstileKey((value) => value + 1)
      setStatus('success')
    } catch {
      setTurnstileKey((value) => value + 1)
      setStatus('error')
    }
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <div className="newsletter-fields">
        <label>
          First name
          <input autoComplete="given-name" maxLength={100} name="firstName" required />
        </label>
        <label>
          Last name
          <input autoComplete="family-name" maxLength={100} name="lastName" required />
        </label>
        <label>
          Email
          <input autoComplete="email" maxLength={254} name="email" required type="email" />
        </label>
      </div>
      <label className="contact-honeypot" tabIndex={-1}>
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      {siteKey ? (
        <TurnstileField action="newsletter" key={turnstileKey} siteKey={siteKey} />
      ) : (
        <p className="form-message error" role="alert">
          Newsletter verification is not configured.
        </p>
      )}
      {consentText ? <p className="newsletter-consent">{consentText}</p> : null}
      <button
        className={buttonClassName(buttonVariant)}
        disabled={status === 'sending' || !siteKey}
        type="submit"
      >
        {status === 'sending' ? (
          'Subscribing…'
        ) : (
          <LinkLabel icon={submitIcon} iconPosition={submitIconPosition} label={submitLabel} />
        )}
      </button>
      <div aria-live="polite">
        {status === 'success' ? <p className="form-message success">{successMessage}</p> : null}
        {status === 'error' ? (
          <p className="form-message error">Subscription failed. Please try again shortly.</p>
        ) : null}
      </div>
    </form>
  )
}
