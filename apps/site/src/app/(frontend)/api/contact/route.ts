import { getPayload } from 'payload'

import { contactSubmissionSchema } from '@starter/contracts'
import config from '@/payload.config'

export const runtime = 'nodejs'

type TurnstileResponse = {
  action?: string
  success?: boolean
}

function escapeHTML(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ||
      character,
  )
}

function json(body: object, status: number) {
  return Response.json(body, { headers: { 'cache-control': 'no-store' }, status })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  const parsed = contactSubmissionSchema.safeParse(body)
  if (!parsed.success) return json({ error: 'Check the form fields and try again.' }, 400)

  const submission = parsed.data
  if (submission.website) return json({ ok: true }, 200)

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  const contactAddress = process.env.CONTACT_TO_ADDRESS
  if (!turnstileSecret || !contactAddress || !process.env.RESEND_API_KEY) {
    console.error('Contact form is missing server-side email or Turnstile configuration.')
    return json({ error: 'Contact form is temporarily unavailable.' }, 503)
  }

  const verificationBody = new URLSearchParams({
    response: submission.turnstileToken,
    secret: turnstileSecret,
  })
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwardedFor) verificationBody.set('remoteip', forwardedFor)

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: verificationBody,
      method: 'POST',
    })
    const result = (await verification.json()) as TurnstileResponse
    if (!verification.ok || !result.success || result.action !== 'contact') {
      return json({ error: 'Verification failed. Please try again.' }, 400)
    }

    const payload = await getPayload({ config })
    await payload.sendEmail({
      html: `<h1>New website inquiry</h1><p><strong>Name:</strong> ${escapeHTML(submission.name)}</p><p><strong>Email:</strong> ${escapeHTML(submission.email)}</p><p><strong>Message:</strong></p><p>${escapeHTML(submission.message).replace(/\n/g, '<br>')}</p>`,
      replyTo: submission.email,
      subject: `Website inquiry from ${submission.name}`,
      text: `Name: ${submission.name}\nEmail: ${submission.email}\n\n${submission.message}`,
      to: contactAddress,
    })

    return json({ ok: true }, 200)
  } catch (error) {
    console.error('Contact form delivery failed.', error)
    return json({ error: 'Your message could not be sent. Please try again shortly.' }, 502)
  }
}
