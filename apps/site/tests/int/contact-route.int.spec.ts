import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendEmail = vi.fn()

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ sendEmail })),
}))
vi.mock('@/payload.config', () => ({ default: Promise.resolve({}) }))

import { POST } from '@/app/(frontend)/api/contact/route'

const validSubmission = {
  email: 'daniel@example.com',
  message: 'I would like to discuss a software project.',
  name: 'Daniel Markland',
  turnstileToken: 'verified-token',
  website: '',
}

function request(body: unknown) {
  return new Request('http://localhost/api/contact', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    method: 'POST',
  })
}

describe('contact route', () => {
  beforeEach(() => {
    vi.stubEnv('CONTACT_TO_ADDRESS', 'inbox@example.com')
    vi.stubEnv('RESEND_API_KEY', 're_test')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-secret')
    sendEmail.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('rejects malformed submissions before external calls', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const response = await POST(request({ ...validSubmission, email: 'invalid' }))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('quietly accepts honeypot submissions without sending email', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const response = await POST(request({ ...validSubmission, website: 'https://spam.example' }))

    expect(response.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('verifies Turnstile and sends valid submissions', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ action: 'contact', success: true }), { status: 200 }),
    )

    const response = await POST(request(validSubmission))

    expect(response.status).toBe(200)
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: validSubmission.email,
        to: 'inbox@example.com',
      }),
    )
  })

  it('rejects failed Turnstile verification', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    )

    const response = await POST(request(validSubmission))

    expect(response.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects Turnstile tokens issued for another action', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ action: 'login', success: true }), { status: 200 }),
    )

    const response = await POST(request(validSubmission))

    expect(response.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
