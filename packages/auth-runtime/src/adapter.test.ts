import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Pool } from 'pg'
import { scopedPostgresAdapter, authSchemaSQL } from './adapter.js'
import { createRealmAuth } from './server.js'
import { realmKey } from './index.js'

const databaseURL = process.env.AUTH_TEST_DATABASE_URL
const pool = new Pool({ connectionString: databaseURL })
const tenantA = {
  kind: 'customer' as const,
  tenantId: '11111111-1111-4111-8111-111111111111',
}
const tenantB = {
  kind: 'customer' as const,
  tenantId: '22222222-2222-4222-8222-222222222222',
}
const configuration = {
  rateLimit: { enabled: true, storage: 'database' as const },
  advanced: { database: { generateId: 'uuid' as const } },
}
const a = scopedPostgresAdapter(pool, tenantA)(configuration)
const b = scopedPostgresAdapter(pool, tenantB)(configuration)
const platform = scopedPostgresAdapter(pool, { kind: 'platform' })(
  configuration,
)
const user = (email = 'seller@example.test') => ({
  id: randomUUID(),
  name: 'Seller',
  email,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('realm configuration', () => {
  it('requires explicit valid tenant identity', () => {
    expect(() =>
      realmKey({ kind: 'customer', tenantId: '../platform' }),
    ).toThrow()
    expect(realmKey({ kind: 'platform' })).toBe('platform')
  })
  it('rejects insecure production origins', () => {
    expect(() =>
      createRealmAuth({
        pool,
        realm: tenantA,
        baseURL: 'http://app.example.test',
        secret: 's'.repeat(32),
      }),
    ).toThrow('HTTPS')
  })
})

describe.skipIf(!databaseURL)('PostgreSQL authentication isolation', () => {
  beforeAll(async () => {
    // Refuse accidental use against a deployment database.
    const url = new URL(databaseURL!)
    if (
      !['localhost', '127.0.0.1'].includes(url.hostname) ||
      !url.pathname.endsWith('_test')
    )
      throw new Error('Tests require a dedicated local *_test database')
    await pool.query(authSchemaSQL)
  })
  beforeEach(async () => {
    await pool.query('truncate identity.records')
  })
  afterAll(async () => {
    await pool.end()
  })
  it('enforces realm isolation in PostgreSQL even without an application filter and clears pooled context', async () => {
    await a.create({ forceAllowId: true, model: 'user', data: user() })
    await b.create({ forceAllowId: true, model: 'user', data: user() })
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('SET LOCAL ROLE identity_runtime')
      await client.query(
        "select set_config('groovepost.identity_realm',$1,true)",
        [realmKey(tenantA)],
      )
      const result = await client.query('select realm from identity.records')
      expect(result.rows).toEqual([{ realm: realmKey(tenantA) }])
      await client.query('COMMIT')
      await client.query('BEGIN')
      await client.query('SET LOCAL ROLE identity_runtime')
      expect(
        (await client.query('select realm from identity.records')).rows,
      ).toHaveLength(0)
      await client.query('ROLLBACK')
    } finally {
      client.release()
    }
  })
  it('keeps identical emails separate, including OR predicates', async () => {
    const ua = await a.create({
      forceAllowId: true,
      model: 'user',
      data: user(),
    })
    const ub = await b.create({
      forceAllowId: true,
      model: 'user',
      data: user(),
    })
    await platform.create({ forceAllowId: true, model: 'user', data: user() })
    const rows = await a.findMany({
      model: 'user',
      where: [
        { field: 'id', value: ub.id },
        { field: 'email', value: 'seller@example.test', connector: 'OR' },
      ],
    })
    expect(rows.map((row: any) => row.id)).toEqual([ua.id])
    expect(
      await a.findOne({
        model: 'user',
        where: [{ field: 'id', value: ub.id }],
      }),
    ).toBeNull()
    expect(await a.count({ model: 'user' })).toBe(1)
  })
  it('enforces unique email within a realm', async () => {
    await a.create({ forceAllowId: true, model: 'user', data: user() })
    await expect(
      a.create({
        forceAllowId: true,
        model: 'user',
        data: user('SELLER@example.test'),
      }),
    ).rejects.toThrow()
  })
  it('rejects a session referencing another tenant and cascades only its own sessions', async () => {
    const ua = await a.create({
      forceAllowId: true,
      model: 'user',
      data: user(),
    })
    await expect(
      b.create({
        forceAllowId: true,
        model: 'session',
        data: {
          id: randomUUID(),
          userId: ua.id,
          token: 'cross',
          expiresAt: new Date(Date.now() + 60000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ).rejects.toThrow('same realm')
    await a.create({
      forceAllowId: true,
      model: 'session',
      data: {
        id: randomUUID(),
        userId: ua.id,
        token: 'own',
        expiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    await a.delete({ model: 'user', where: [{ field: 'id', value: ua.id }] })
    expect(await a.count({ model: 'session' })).toBe(0)
  })
  it('consumes a one-time verification exactly once under concurrency', async () => {
    await a.create({
      forceAllowId: true,
      model: 'verification',
      data: {
        id: randomUUID(),
        identifier: 'otp',
        value: 'secret',
        expiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        a.consumeOne!({
          model: 'verification',
          where: [{ field: 'identifier', value: 'otp' }],
        }),
      ),
    )
    expect(results.filter(Boolean)).toHaveLength(1)
  })
  it('increments counters atomically and rolls back failed transactions', async () => {
    await a.create({
      forceAllowId: true,
      model: 'rateLimit',
      data: {
        id: randomUUID(),
        key: 'test',
        count: 0,
        lastRequest: Date.now(),
      },
    })
    await Promise.all(
      Array.from({ length: 10 }, () =>
        a.incrementOne!({
          model: 'rateLimit',
          where: [{ field: 'key', value: 'test' }],
          increment: { count: 1 },
        }),
      ),
    )
    expect(
      (
        await a.findOne<any>({
          model: 'rateLimit',
          where: [{ field: 'key', value: 'test' }],
        })
      ).count,
    ).toBe(10)
    await expect(
      a.transaction(async (tx) => {
        await tx.create({ forceAllowId: true, model: 'user', data: user() })
        throw new Error('rollback')
      }),
    ).rejects.toThrow('rollback')
    expect(await a.count({ model: 'user' })).toBe(0)
  })
  it('runs Better Auth signup/login and rejects a session in another realm', async () => {
    const sent: string[] = []
    const base = {
      pool,
      baseURL: 'http://localhost:3000',
      secret: 's'.repeat(32),
      sendVerificationEmail: async ({ url }: { url: string }) => {
        sent.push(url)
      },
      sendResetPassword: async ({ url }: { url: string }) => {
        sent.push(url)
      },
    }
    const first = createRealmAuth({ ...base, realm: tenantA })
    const second = createRealmAuth({ ...base, realm: tenantB })
    const signup = await first.api.signUpEmail({
      body: {
        email: 'seller@example.test',
        password: 'test-password-123!',
        name: 'Seller',
      },
    })
    expect(signup.user.email).toBe('seller@example.test')
    expect(sent).toHaveLength(1)
    const verification = await first.handler(new Request(sent[0]))
    expect(verification.status).toBeLessThan(400)
    const login = await first.api.signInEmail({
      body: { email: 'seller@example.test', password: 'test-password-123!' },
      returnHeaders: true,
    })
    const cookie = login.headers.get('set-cookie')!
    expect(cookie).toContain('gp_')
    expect(
      await first.api.getSession({ headers: new Headers({ cookie }) }),
    ).not.toBeNull()
    expect(
      await second.api.getSession({ headers: new Headers({ cookie }) }),
    ).toBeNull()
    await first.api.requestPasswordReset({
      body: {
        email: 'seller@example.test',
        redirectTo: 'http://localhost:3000/reset',
      },
    })
    const token = new URL(sent[1]).pathname.split('/').pop()!
    await first.api.resetPassword({
      body: { token, newPassword: 'replacement-password-123!' },
    })
    expect(
      await first.api.getSession({ headers: new Headers({ cookie }) }),
    ).toBeNull()
    await expect(
      first.api.resetPassword({
        body: { token, newPassword: 'another-password-123!' },
      }),
    ).rejects.toThrow()
    expect(
      (
        await first.api.signInEmail({
          body: {
            email: 'seller@example.test',
            password: 'replacement-password-123!',
          },
        })
      ).user.id,
    ).toBe(signup.user.id)
  })
  it('creates a verified phone customer without exposing or reusing another tenant session', async () => {
    let code = ''
    const auth = createRealmAuth({
      pool,
      realm: tenantA,
      baseURL: 'http://localhost:3000',
      secret: 's'.repeat(32),
      sendPhoneOTP: async (_phone, otp) => {
        code = otp
      },
    })
    const request = (path: string, body: unknown) =>
      auth.handler(
        new Request('http://localhost:3000/api/auth/' + path, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            origin: 'http://localhost:3000',
          },
          body: JSON.stringify(body),
        }),
      )
    expect(
      (await request('phone-number/send-otp', { phoneNumber: '+15551234567' }))
        .status,
    ).toBe(200)
    const response = await request('phone-number/verify', {
      phoneNumber: '+15551234567',
      code,
    })
    expect(response.status).toBe(200)
    const headers = new Headers({ cookie: response.headers.get('set-cookie')! })
    const session = await auth.api.getSession({ headers })
    expect(session?.user).toMatchObject({
      phoneNumber: '+15551234567',
      phoneNumberVerified: true,
    })
    expect(
      (
        await request('phone-number/verify', {
          phoneNumber: '+15551234567',
          code,
        })
      ).status,
    ).toBeGreaterThanOrEqual(400)
  })
  it('does not let email signup reserve or verify another customer phone', async () => {
    let code = ''
    const auth = createRealmAuth({
      pool,
      realm: tenantA,
      baseURL: 'http://localhost:3000',
      secret: 's'.repeat(32),
      sendPhoneOTP: async (_phone, value) => {
        code = value
      },
      sendVerificationEmail: async () => {},
      sendResetPassword: async () => {},
    })
    const post = (path: string, body: unknown) =>
      auth.handler(
        new Request('http://localhost:3000/api/auth/' + path, {
          method: 'POST',
          headers: {
            origin: 'http://localhost:3000',
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
        }),
      )
    await post('sign-up/email', {
      name: 'Unverified caller',
      email: 'claim@example.test',
      password: 'test-password-123!',
      phoneNumber: '+15555550111',
      phoneNumberVerified: true,
      role: 'admin',
    })
    const claimed = await pool.query(
      "select data from identity.records where realm=$1 and model='user' and data->>'phoneNumber'=$2",
      [realmKey(tenantA), '+15555550111'],
    )
    expect(claimed.rows).toHaveLength(0)
    expect(
      (await post('phone-number/send-otp', { phoneNumber: '+15555550111' }))
        .status,
    ).toBe(200)
    const verified = await post('phone-number/verify', {
      phoneNumber: '+15555550111',
      code,
    })
    expect(verified.status).toBe(200)
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: verified.headers.get('set-cookie')! }),
    })
    expect(session?.user.email).not.toBe('claim@example.test')
  })
  it('completes OAuth PKCE consent, rejects replay, refreshes and revokes access', async () => {
    const { createDeveloperAuth } = await import('./server.js')
    let verificationURL = ''
    const resource = 'http://localhost:3000/api/mcp'
    const auth = createDeveloperAuth(
      {
        pool,
        realm: { kind: 'platform' },
        baseURL: 'http://localhost:3000',
        secret: 's'.repeat(32),
        sendVerificationEmail: async ({ url }) => {
          verificationURL = url
        },
        sendResetPassword: async () => {},
      },
      {
        loginPage: '/login',
        consentPage: '/consent',
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
        scopes: ['groovepost:api', 'offline_access'],
        resources: [resource],
        clientRegistrationDefaultResources: [resource],
      },
    )
    const post = (
      path: string,
      body: unknown,
      headers: Record<string, string> = {},
    ) =>
      auth.handler(
        new Request('http://localhost:3000/api/auth/' + path, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            origin: 'http://localhost:3000',
            ...headers,
          },
          body: JSON.stringify(body),
        }),
      )
    const register = await post('oauth2/register', {
      client_name: 'Independent test',
      redirect_uris: ['https://client.example.test/callback'],
      token_endpoint_auth_method: 'client_secret_post',
      grant_types: ['authorization_code', 'refresh_token'],
      scope: 'groovepost:api offline_access',
    })
    expect(register.status).toBe(201)
    const client = await register.json()
    await auth.api.signUpEmail({
      body: {
        email: 'developer@example.test',
        password: 'test-password-123!',
        name: 'Developer',
      },
    })
    await auth.handler(new Request(verificationURL))
    const login = await auth.api.signInEmail({
      body: { email: 'developer@example.test', password: 'test-password-123!' },
      returnHeaders: true,
    })
    const cookie = login.headers.get('set-cookie')!
    const { createHash } = await import('node:crypto')
    const verifier = 'v'.repeat(64)
    const query = new URLSearchParams({
      response_type: 'code',
      client_id: client.client_id,
      redirect_uri: 'https://client.example.test/callback',
      scope: 'groovepost:api offline_access',
      state: 'opaque-state',
      resource,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256',
    })
    const authorize = await auth.handler(
      new Request('http://localhost:3000/api/auth/oauth2/authorize?' + query, {
        headers: { cookie },
      }),
    )
    expect(authorize.status).toBe(302)
    const consentURL = new URL(
      authorize.headers.get('location')!,
      'http://localhost:3000',
    )
    const consent = await post(
      'oauth2/consent',
      { accept: true, oauth_query: consentURL.search.slice(1) },
      { cookie },
    )
    expect(consent.status).toBe(200)
    const redirect = new URL((await consent.json()).url)
    expect(redirect.searchParams.get('state')).toBe('opaque-state')
    const exchange = (fields: Record<string, string>) =>
      auth.handler(
        new Request('http://localhost:3000/api/auth/oauth2/token', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: client.client_id,
            client_secret: client.client_secret,
            ...fields,
          }),
        }),
      )
    const grant = {
      grant_type: 'authorization_code',
      code: redirect.searchParams.get('code')!,
      redirect_uri: 'https://client.example.test/callback',
      code_verifier: verifier,
      resource,
    }
    const token = await exchange(grant)
    expect(token.status).toBe(200)
    const tokens = await token.json()
    const introspect = async (access: string) => {
      const result = await auth.handler(
        new Request('http://localhost:3000/api/auth/oauth2/introspect', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: access,
            client_id: client.client_id,
            client_secret: client.client_secret,
          }),
        }),
      )
      expect(result.status).toBe(200)
      return result.json()
    }
    expect(await introspect(tokens.access_token)).toMatchObject({
      active: true,
      aud: resource,
    })
    const refreshed = await exchange({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      resource,
    })
    expect(
      refreshed.status,
      refreshed.ok ? '' : await refreshed.clone().text(),
    ).toBe(200)
    const fresh = await refreshed.json()
    const revoked = await auth.handler(
      new Request('http://localhost:3000/api/auth/oauth2/revoke', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: fresh.access_token,
          client_id: client.client_id,
          client_secret: client.client_secret,
        }),
      }),
    )
    expect(revoked.status, revoked.ok ? '' : await revoked.clone().text()).toBe(
      200,
    )
    expect(await introspect(fresh.access_token)).toMatchObject({
      active: false,
    })
    expect((await exchange(grant)).status).toBeGreaterThanOrEqual(400)
  })
})
