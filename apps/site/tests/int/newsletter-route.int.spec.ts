import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const findGlobal = vi.fn()
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ findGlobal })) }))
vi.mock('@/payload.config', () => ({ default: Promise.resolve({}) }))

import { apiApp } from '@/lib/api/app'
const POST = (request: Request) => apiApp.fetch(request)

const validSubmission = {
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  turnstileToken: 'verified-token',
  website: '',
}

function request(body: unknown) {
  return new Request('http://localhost/api/v1/newsletter', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}

describe('newsletter route', () => {
  beforeEach(() => {
    vi.stubEnv('MAILERLITE_API_KEY', 'mailer-token')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-secret')
    vi.stubEnv(
      'NEWSLETTER_DESTINATIONS',
      JSON.stringify([{ id: 'readers', name: 'Readers', groupId: '123', isDefault: true }]),
    )
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('verifies Turnstile and subscribes to the configured group', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ action: 'newsletter', success: true }), { status: 200 }),
    )
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: {} }), { status: 201 }))

    expect((await POST(request(validSubmission))).status).toBe(200)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://connect.mailerlite.com/api/subscribers',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'ada@example.com',
          fields: { name: 'Ada', last_name: 'Lovelace' },
          groups: ['123'],
        }),
      }),
    )
  })

  it('quietly accepts honeypot submissions without external calls', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    expect(
      (await POST(request({ ...validSubmission, website: 'https://spam.example' }))).status,
    ).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects disabled, unconfigured, and wrongly verified submissions', async () => {
    vi.stubEnv('NEWSLETTER_DESTINATIONS', '[]')
    expect((await POST(request(validSubmission))).status).toBe(503)
    vi.stubEnv(
      'NEWSLETTER_DESTINATIONS',
      JSON.stringify([{ id: 'readers', name: 'Readers', groupId: '123', isDefault: true }]),
    )

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ action: 'contact', success: true }), { status: 200 }),
    )
    expect((await POST(request(validSubmission))).status).toBe(400)
  })

  it('returns a generic delivery error when MailerLite fails', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ action: 'newsletter', success: true }), { status: 200 }),
    )
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 429 }))

    const response = await POST(request(validSubmission))
    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: { code: 'upstream_error', message: 'Subscription failed. Please try again shortly.' },
    })
  })
})
