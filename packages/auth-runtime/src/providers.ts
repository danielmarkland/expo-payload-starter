export type IdentityProviders = {
  google?: { clientId: string; clientSecret: string }
  facebook?: { clientId: string; clientSecret: string }
  twilio?: { accountSid: string; authToken: string; verifyServiceSid: string }
  email?: { apiKey: string; from: string }
}

export async function twilioVerification(
  config: NonNullable<IdentityProviders['twilio']>,
  phone: string,
  code?: string,
) {
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('Invalid phone number')
  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${encodeURIComponent(config.verifyServiceSid)}/${code === undefined ? 'Verifications' : 'VerificationCheck'}`,
    {
      method: 'POST',
      headers: {
        authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        code === undefined
          ? { To: phone, Channel: 'sms' }
          : { To: phone, Code: code },
      ),
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    },
  )
  if (code !== undefined && [400, 404].includes(response.status)) return false
  if (!response.ok)
    throw new Error('SMS verification is temporarily unavailable')
  const result = (await response.json()) as { status?: string }
  return code === undefined || result.status === 'approved'
}

export async function sendIdentityEmail(
  config: NonNullable<IdentityProviders['email']>,
  email: string,
  url: string,
  purpose: 'verification' | 'reset',
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from,
      to: [email],
      subject:
        purpose === 'verification'
          ? 'Verify your email'
          : 'Reset your password',
      text: url,
    }),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Email delivery is temporarily unavailable')
}
