import { createClient } from 'npm:@supabase/supabase-js@2.117.2'
import { Webhook } from 'npm:svix@1.81.0'

Deno.serve(async (request) => {
  if (request.method !== 'POST')
    return new Response('Method not allowed', { status: 405 })
  const payload = await request.text()
  let event: Record<string, unknown>
  try {
    event = new Webhook(Deno.env.get('RESEND_WEBHOOK_SECRET') ?? '').verify(
      payload,
      {
        'svix-id': request.headers.get('svix-id') ?? '',
        'svix-signature': request.headers.get('svix-signature') ?? '',
        'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
      },
    ) as Record<string, unknown>
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const data = event.data as Record<string, unknown> | undefined
  const rawType =
    typeof event.type === 'string' ? event.type.replace('email.', '') : ''
  const type = rawType === 'delivery_delayed' ? 'sent' : rawType
  if (!['sent', 'delivered', 'bounced', 'complained'].includes(type)) {
    return new Response(null, { status: 204 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
  const { error } = await supabase
    .schema('app')
    .from('email_delivery_events')
    .upsert(
      {
        email_id: String(data?.email_id ?? data?.id ?? ''),
        event_type: type,
        occurred_at: String(event.created_at ?? new Date().toISOString()),
        payload: event,
      },
      { onConflict: 'email_id,event_type,occurred_at', ignoreDuplicates: true },
    )
  return error
    ? new Response('Persistence failed', { status: 500 })
    : new Response(null, { status: 204 })
})
