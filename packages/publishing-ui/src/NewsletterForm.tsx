'use client'

import { usePublishingFormSubmission } from './usePublishingFormSubmission.js'

import {
  buttonClassName,
  type ButtonVariant,
} from '@danielmarkland/publishing-core/buttonVariants'
import type { ComponentType, ComponentProps } from 'react'
import type { createLinkComponents } from './LinkAction.js'
import { useSiteConfig } from './SiteConfigProvider.js'
import { TurnstileField } from './TurnstileField.js'

export function createNewsletterForm({
  LinkLabel,
}: {
  LinkLabel: ComponentType<
    ComponentProps<ReturnType<typeof createLinkComponents>['LinkLabel']>
  >
}) {
  return function NewsletterForm({
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
    const siteKey = useSiteConfig().integrations.turnstileSiteKey
    const { status, turnstileKey, submit } = usePublishingFormSubmission({
      endpoint: '/api/v1/newsletter',
      siteKey,
      fields: (data) => ({
        email: data.get('email'),
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
      }),
    })

    return (
      <form className="newsletter-form" onSubmit={submit}>
        <div className="newsletter-fields">
          <label>
            First name
            <input
              autoComplete="given-name"
              maxLength={100}
              name="firstName"
              required
            />
          </label>
          <label>
            Last name
            <input
              autoComplete="family-name"
              maxLength={100}
              name="lastName"
              required
            />
          </label>
          <label>
            Email
            <input
              autoComplete="email"
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>
        </div>
        <label className="contact-honeypot" tabIndex={-1}>
          Website
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
        {siteKey ? (
          <TurnstileField
            action="newsletter"
            key={turnstileKey}
            siteKey={siteKey}
          />
        ) : (
          <p className="form-message error" role="alert">
            Newsletter verification is not configured.
          </p>
        )}
        {consentText ? (
          <p className="newsletter-consent">{consentText}</p>
        ) : null}
        <button
          className={buttonClassName(buttonVariant)}
          disabled={status === 'sending' || !siteKey}
          type="submit"
        >
          {status === 'sending' ? (
            'Subscribing…'
          ) : (
            <LinkLabel
              icon={submitIcon}
              iconPosition={submitIconPosition}
              label={submitLabel}
            />
          )}
        </button>
        <div aria-live="polite">
          {status === 'success' ? (
            <p className="form-message success">{successMessage}</p>
          ) : null}
          {status === 'error' ? (
            <p className="form-message error">
              Subscription failed. Please try again shortly.
            </p>
          ) : null}
        </div>
      </form>
    )
  }
}
