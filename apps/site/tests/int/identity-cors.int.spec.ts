import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('@danielmarkland/publishing-core/serverEnvironment', () => ({
  getSiteURL: () => 'https://site.example.test',
}))
import { identityCors, identityPreflight } from '@/lib/identity/cors'
import { configuredIdentityProviders } from '@/lib/identity/server'
afterEach(() => vi.unstubAllEnvs())
describe('standalone setup identity transport', () => {
  it('allows configured Expo web origins with credentials and rejects arbitrary origins', () => {
    vi.stubEnv('AUTH_TRUSTED_ORIGINS', 'https://site.example.test,http://localhost:8081,myapp://')
    const request = new Request('https://site.example.test/api/auth/get-session', {
      headers: { origin: 'http://localhost:8081' },
    })
    const response = identityCors(
      request,
      new Response('ok', { headers: { 'set-cookie': 'session=fixture; HttpOnly' } }),
    )
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:8081')
    expect(response.headers.get('access-control-allow-credentials')).toBe('true')
    expect(response.headers.get('set-cookie')).toContain('HttpOnly')
    expect(identityPreflight(request).status).toBe(204)
    const foreign = new Request(request.url, {
      headers: { origin: 'https://untrusted.example.test' },
    })
    expect(identityPreflight(foreign).status).toBe(403)
    expect(
      identityCors(foreign, new Response('ok')).headers.has('access-control-allow-origin'),
    ).toBe(false)
  })
  it('bootstrap password login does not advertise unavailable signup or email recovery', () => {
    vi.stubEnv('AUTH_EMAIL_API_KEY', '')
    vi.stubEnv('AUTH_EMAIL_FROM', '')
    vi.stubEnv('EDITOR_AUTH_EMAIL_API_KEY', '')
    vi.stubEnv('EDITOR_AUTH_EMAIL_FROM', '')
    const customer = configuredIdentityProviders()
    expect(customer).toMatchObject({ email: true, emailDelivery: false, passwordSignup: false })
    vi.stubEnv('AUTH_EMAIL_API_KEY', 'fixture')
    vi.stubEnv('AUTH_EMAIL_FROM', 'verified@example.test')
    expect(configuredIdentityProviders()).toMatchObject({
      email: true,
      emailDelivery: true,
      passwordSignup: true,
    })
    expect(configuredIdentityProviders('editor').passwordSignup).toBe(false)
  })
})
