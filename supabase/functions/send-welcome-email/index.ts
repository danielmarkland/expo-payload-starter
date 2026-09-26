import { createClient } from 'npm:@supabase/supabase-js@2.117.2'
import { Resend } from 'npm:resend@6.30.0'

import {
  welcomeEmailSubject,
  welcomeEmailText,
} from '../../../packages/email/src/welcome-email-content.ts'
import { corsHeaders } from '../_shared/cors.ts'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST')
    return response({ error: 'Method not allowed' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization) return response({ error: 'Unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } },
  )
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.email)
    return response({ error: 'Unauthorized' }, 401)

  const body = (await request.json().catch(() => null)) as {
    idempotencyKey?: unknown
  } | null
  if (
    typeof body?.idempotencyKey !== 'string' ||
    !uuidPattern.test(body.idempotencyKey)
  ) {
    return response({ error: 'A UUID idempotencyKey is required' }, 400)
  }

  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
  const displayName =
    typeof data.user.user_metadata.full_name === 'string'
      ? data.user.user_metadata.full_name
      : data.user.email
  const { data: sent, error: sendError } = await resend.emails.send(
    {
      from:
        Deno.env.get('RESEND_FROM') ??
        'Expo Payload Starter <onboarding@resend.dev>',
      subject: welcomeEmailSubject(),
      text: welcomeEmailText(displayName),
      to: data.user.email,
    },
    { idempotencyKey: body.idempotencyKey },
  )
  if (sendError) return response({ error: 'Email delivery failed' }, 502)
  return response({ id: sent?.id }, 202)
})

function response(body: unknown, status: number) {
  return Response.json(body, { headers: corsHeaders, status })
}
