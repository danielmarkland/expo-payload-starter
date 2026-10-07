import type {
  ContactSubmission,
  NewsletterSubmission,
} from '@danielmarkland/publishing-contracts'
import {
  ServiceUnavailableError,
  UpstreamError,
  ValidationError,
} from './serviceErrors.js'
import type {
  getContactEmailConfig,
  getNewsletterConfig as newsletterConfig,
} from './serverEnvironment.js'
export type PublishingEmail = {
  html: string
  replyTo: string
  subject: string
  text: string
  to: string
}
export function createContactDelivery({
  getEmailConfig,
  getSendEmail,
}: {
  getEmailConfig: () => ReturnType<typeof getContactEmailConfig>
  getSendEmail: () => Promise<(email: PublishingEmail) => Promise<unknown>>
}) {
  async function deliverContact(
    submission: ContactSubmission,
    request: Request,
  ) {
    if (submission.website) return
    const email = getEmailConfig()
    if (
      !email.turnstileSecret ||
      !email.toAddress ||
      !email.apiKey ||
      !email.fromAddress
    ) {
      throw new ServiceUnavailableError(
        'Contact form is temporarily unavailable.',
      )
    }
    await verifyTurnstile(
      submission.turnstileToken,
      'contact',
      request,
      email.turnstileSecret,
    )
    const sendEmail = await getSendEmail()
    const name =
      submission.name || `${submission.firstName} ${submission.lastName}`
    const companyHTML = submission.company
      ? `<p><strong>Company:</strong> ${escapeHTML(submission.company)}</p>`
      : ''
    const companyText = submission.company
      ? `Company: ${submission.company}\n`
      : ''
    try {
      await sendEmail({
        html: `<h1>New website inquiry</h1><p><strong>Name:</strong> ${escapeHTML(name)}</p><p><strong>Email:</strong> ${escapeHTML(submission.email)}</p>${companyHTML}<p><strong>Message:</strong></p><p>${escapeHTML(submission.message).replace(/\n/g, '<br>')}</p>`,
        replyTo: submission.email,
        subject: `Website inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${submission.email}\n${companyText}\n${submission.message}`,
        to: email.toAddress,
      })
    } catch {
      throw new UpstreamError(
        'Your message could not be sent. Please try again shortly.',
      )
    }
  }

  return deliverContact
}
export function createNewsletterDelivery({
  getNewsletterConfig,
  getNewsletterGroup,
}: {
  getNewsletterConfig: () => ReturnType<typeof newsletterConfig>
  getNewsletterGroup: () => Promise<string | null>
}) {
  async function subscribeToNewsletter(
    submission: NewsletterSubmission,
    request: Request,
  ) {
    if (submission.website) return
    const newsletter = getNewsletterConfig()
    const groupId = await getNewsletterGroup()
    if (!groupId || !newsletter.apiKey || !newsletter.turnstileSecret) {
      throw new ServiceUnavailableError(
        'Newsletter signup is temporarily unavailable.',
      )
    }
    await verifyTurnstile(
      submission.turnstileToken,
      'newsletter',
      request,
      newsletter.turnstileSecret,
    )
    const response = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        body: JSON.stringify({
          email: submission.email,
          fields: {
            last_name: submission.lastName,
            name: submission.firstName,
          },
          groups: [groupId],
          status: 'active',
        }),
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${newsletter.apiKey}`,
          'content-type': 'application/json',
        },
        method: 'POST',
        signal: AbortSignal.timeout(10_000),
      },
    )
    if (!response.ok)
      throw new UpstreamError('Subscription failed. Please try again shortly.')
  }

  return subscribeToNewsletter
}
export async function verifyTurnstile(
  token: string,
  action: string,
  request: Request,
  secret: string,
) {
  const body = new URLSearchParams({ response: token, secret })
  const forwardedFor = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim()
  if (forwardedFor) body.set('remoteip', forwardedFor)
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      body,
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
    },
  )
  const result = (await response.json()) as {
    action?: string
    hostname?: string
    success?: boolean
  }
  if (!response.ok || !result.success || result.action !== action) {
    throw new ValidationError('Verification failed. Please try again.')
  }
  return result
}

function escapeHTML(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[
        character
      ] || character,
  )
}
