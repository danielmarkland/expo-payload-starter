import { getPayload } from 'payload'

import { newsletterSubmissionSchema } from '@starter/contracts'
import { getNewsletterConfig } from '@/lib/serverConfig'
import config from '@/payload.config'

export const runtime = 'nodejs'

type TurnstileResponse = { action?: string; success?: boolean }

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

  const parsed = newsletterSubmissionSchema.safeParse(body)
  if (!parsed.success) return json({ error: 'Check the form fields and try again.' }, 400)
  const submission = parsed.data
  if (submission.website) return json({ ok: true }, 200)

  const newsletter = getNewsletterConfig()
  let groupId: null | string = null
  try {
    const payload = await getPayload({ config })
    const footer = await payload.findGlobal({ slug: 'footerNavigation', depth: 0 })
    groupId = footer.newsletter?.show ? footer.newsletter.groupId?.trim() || null : null
  } catch (error) {
    console.error('Newsletter configuration could not be loaded.', error)
  }
  if (!groupId || !newsletter.apiKey || !newsletter.turnstileSecret) {
    console.error('Newsletter signup is disabled or missing server-side configuration.')
    return json({ error: 'Newsletter signup is temporarily unavailable.' }, 503)
  }

  const verificationBody = new URLSearchParams({
    response: submission.turnstileToken,
    secret: newsletter.turnstileSecret,
  })
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwardedFor) verificationBody.set('remoteip', forwardedFor)

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: verificationBody,
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
    })
    const result = (await verification.json()) as TurnstileResponse
    if (!verification.ok || !result.success || result.action !== 'newsletter') {
      return json({ error: 'Verification failed. Please try again.' }, 400)
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      body: JSON.stringify({
        email: submission.email,
        fields: { last_name: submission.lastName, name: submission.firstName },
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
    })
    if (!response.ok) throw new Error(`MailerLite returned ${response.status}.`)
    return json({ ok: true }, 200)
  } catch (error) {
    console.error('Newsletter subscription failed.', error)
    return json({ error: 'Subscription failed. Please try again shortly.' }, 502)
  }
}
