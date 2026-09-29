'use client'

import Script from 'next/script'
import { type FormEvent, useState } from 'react'

import { buttonClassName, type ButtonVariant } from '@/lib/buttonVariants'

type FormStatus = 'error' | 'idle' | 'sending' | 'success'

declare global {
  interface Window {
    turnstile?: { reset: () => void }
  }
}

export function ContactForm({
  submitButtonVariant,
  submitLabel,
  successMessage,
}: {
  submitButtonVariant?: ButtonVariant | null
  submitLabel: string
  successMessage: string
}) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending' || !siteKey) return

    const form = event.currentTarget
    const data = new FormData(form)
    setStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify({
          email: data.get('email'),
          message: data.get('message'),
          name: data.get('name'),
          turnstileToken: data.get('cf-turnstile-response'),
          website: data.get('website'),
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) throw new Error('Contact request failed')

      form.reset()
      window.turnstile?.reset()
      setStatus('success')
    } catch {
      window.turnstile?.reset()
      setStatus('error')
    }
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <form className="contact-form" onSubmit={submit}>
        <label>
          Name
          <input autoComplete="name" maxLength={100} name="name" required type="text" />
        </label>
        <label>
          Email
          <input autoComplete="email" maxLength={254} name="email" required type="email" />
        </label>
        <label>
          Message
          <textarea maxLength={5000} minLength={10} name="message" required rows={7} />
        </label>
        <label className="contact-honeypot" tabIndex={-1}>
          Website
          <input autoComplete="off" name="website" tabIndex={-1} type="text" />
        </label>
        {siteKey ? (
          <div className="cf-turnstile" data-action="contact" data-sitekey={siteKey} />
        ) : (
          <p className="form-message error" role="alert">
            Contact form verification is not configured.
          </p>
        )}
        <button
          className={buttonClassName(submitButtonVariant)}
          disabled={status === 'sending' || !siteKey}
          type="submit"
        >
          {status === 'sending' ? 'Sending…' : submitLabel}
        </button>
        <div aria-live="polite">
          {status === 'success' ? <p className="form-message success">{successMessage}</p> : null}
          {status === 'error' ? (
            <p className="form-message error">
              Your message could not be sent. Please try again shortly.
            </p>
          ) : null}
        </div>
      </form>
    </>
  )
}
