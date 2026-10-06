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

export function createContactForm({
  LinkLabel,
}: {
  LinkLabel: ComponentType<
    ComponentProps<ReturnType<typeof createLinkComponents>['LinkLabel']>
  >
}) {
  return function ContactForm({
    nameMode,
    showCompany,
    submitButtonVariant,
    submitIcon,
    submitIconPosition,
    submitLabel,
    successMessage,
  }: {
    nameMode?: 'combined' | 'separate' | null
    showCompany?: boolean | null
    submitButtonVariant?: ButtonVariant | null
    submitIcon?: null | string
    submitIconPosition?: 'left' | 'right' | null
    submitLabel: string
    successMessage: string
  }) {
    const siteKey = useSiteConfig().integrations.turnstileSiteKey
    const { status, turnstileKey, submit } = usePublishingFormSubmission({
      endpoint: '/api/v1/contact',
      siteKey,
      fields: (data) => ({
        email: data.get('email'),
        message: data.get('message'),
        ...(nameMode === 'separate'
          ? { firstName: data.get('firstName'), lastName: data.get('lastName') }
          : { name: data.get('name') }),
        ...(showCompany ? { company: data.get('company') } : {}),
      }),
    })

    return (
      <>
        <form className="contact-form" onSubmit={submit}>
          {nameMode === 'separate' ? (
            <div className="contact-name-fields">
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
            </div>
          ) : (
            <label>
              Name
              <input
                autoComplete="name"
                maxLength={100}
                name="name"
                required
                type="text"
              />
            </label>
          )}
          {showCompany ? (
            <label>
              Company
              <input
                autoComplete="organization"
                maxLength={200}
                name="company"
              />
            </label>
          ) : null}
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
          <label>
            Message
            <textarea
              maxLength={5000}
              minLength={10}
              name="message"
              required
              rows={7}
            />
          </label>
          <label className="contact-honeypot" tabIndex={-1}>
            Website
            <input
              autoComplete="off"
              name="website"
              tabIndex={-1}
              type="text"
            />
          </label>
          {siteKey ? (
            <TurnstileField
              action="contact"
              key={turnstileKey}
              siteKey={siteKey}
            />
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
            {status === 'sending' ? (
              'Sending…'
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
                Your message could not be sent. Please try again shortly.
              </p>
            ) : null}
          </div>
        </form>
      </>
    )
  }
}
