# Authentication runtime

Shared Better Auth backend and client integration for independently hosted starters and Groovepost. This package does not grant tenant membership or platform administrator access.

```ts
import { Pool } from 'pg'
import { createRealmAuth } from '@danielmarkland/auth-runtime/server'

const auth = createRealmAuth({
  pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  realm: { kind: 'customer', tenantId: process.env.IDENTITY_TENANT_ID! },
  baseURL: process.env.SITE_URL!,
  secret: process.env.AUTH_SECRET!,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})

export const GET = auth.handler
export const POST = auth.handler
```

Resolve the realm and origin on the server from verified deployment/tenant records. Never accept a caller-selected realm. Use a separate platform realm for staff; an independent starter can mount editorial authentication at `/api/editor-auth` using `basePath`. Customer and platform cookies have different names, stay host-only, and cannot authorize each other's sessions. Cross-origin/native clients require explicitly configured trusted origins.

Apply `authSchemaSQL` using the migration operator before activation. It owns the `identity` schema and a restricted `identity_runtime` role; the runtime database login must be a member of that role. Every adapter operation sets the role and realm inside a transaction. PostgreSQL RLS enforces the realm, and the transaction clears context before returning a pooled connection. Migrations require permission to create/grant roles; runtime code never executes schema migrations.

`sendPhoneOTP` and optional `verifyPhoneOTP` support SMS providers such as Twilio Verify that issue/consume their own codes. Phone signup uses a reserved synthetic email identifier; it does not assert email verification. Email/password login activates only when both verification and password-reset delivery callbacks are configured. Account linking by matching email is disabled. Account suspension is enforced by Better Auth's admin plugin; host management operations must independently authorize tenant administrators and revoke existing sessions.

`createDeveloperAuth` adds OAuth 2.1 PKCE, consent, refresh and revocable opaque API tokens. Configure explicit resources, allowed scopes, login/consent pages and client registration policy. Resource servers must use authenticated introspection and check issuer, expiry, resource, scope and caller status; never treat tenant membership as a token capability. This factory supplies OAuth API tokens, not OpenID Connect ID tokens.

Client exports: `createAuthClient` and `phoneNumberClient` from `/react`, `expoClient` from `/expo`, and the corresponding server `expo` plugin from `/server`. Hosted sandboxed app packages use Groovepost's SDK bridge instead of importing backend authentication or handling host credentials.

Run `pnpm --filter @danielmarkland/auth-runtime build`. The test suite requires `AUTH_TEST_DATABASE_URL` pointing to a dedicated local PostgreSQL database whose name ends in `_test`; without it only configuration tests run. Integration coverage includes RLS, pooled-context cleanup, cross-tenant references, OTP replay, transactional rollback, email/SMS login and OAuth token lifecycle.

Adding this package does not switch an existing deployment's identity provider. Reconcile existing users, provider subjects, application authorization, ownership and CMS roles before activation. Password hashes and active sessions are not portable; plan for fresh login/password recovery.
