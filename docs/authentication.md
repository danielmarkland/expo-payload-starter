# Authentication

The public `@danielmarkland/auth-runtime` package supplies Better Auth, realm-scoped
PostgreSQL storage and browser/Expo clients. This starter hosts its own backend;
Groovepost-hosted frontend packages instead use the platform SDK session bridge.

Product customers use `/api/auth` and a customer realm from `app.identity_context`.
Editors use `/api/editor-auth` and the separate platform realm. Payload owns CMS
roles and only accepts explicitly linked `authIdentityId` accounts. Signing up
as a customer never grants editorial access. No client receives database or
provider secrets.

## Configure and migrate

1. Apply the product SQL migration and Payload's editorial-link migration. New
   product identities preserve existing Supabase UUIDs and Google/Facebook
   subjects; passwords and sessions are not copied.
2. Set server `AUTH_SECRET` (at least 32 characters), `SITE_URL` and explicit
   `AUTH_TRUSTED_ORIGINS` for the app origin/native scheme. Product realm identity
   is stored in the database; optional `AUTH_TENANT_ID` must match it.
3. Configure product `AUTH_GOOGLE_CLIENT_ID/SECRET`,
   `AUTH_FACEBOOK_CLIENT_ID/SECRET`, `AUTH_TWILIO_ACCOUNT_SID/AUTH_TOKEN/VERIFY_SERVICE_SID`,
   and `AUTH_EMAIL_API_KEY/FROM` as needed. Email delivery uses Resend. Editorial
   providers use the same suffixes under `EDITOR_AUTH_`.
4. Register provider callbacks at `SITE_URL/api/auth/callback/google` or
   `facebook`; editor callbacks use `/api/editor-auth/callback/`. Configure
   Twilio Verify and verified mail senders before real acceptance.
5. Prepare linked staff identities with the operator-only
   `pnpm --filter @starter/site auth:migrate-editors` command. It sends reset
   links and refuses preexisting, unlinked email identities. Review those
   collisions explicitly; it never assigns a role by email matching.
6. Set `AUTH_PROVIDER=better-auth` on the backend and
   `EXPO_PUBLIC_AUTH_PROVIDER=better-auth` on the app together, regenerate the
   Payload import map, and validate login, logout, profile isolation and staff
   permissions. Until then the existing Supabase login remains available.

Use separate database migration/runtime credentials. Grant the host membership
in `identity_runtime` and `starter_product_runtime`; native identity writes and
profile operations switch to their restricted roles inside transactions. Browser
roles cannot read identity records or profiles. BFF profile requests verify the
caller even while the previous login provider is active.

Hosted provider credentials and account migration are deployment prerequisites.
Library installation or a successful build does not confirm a production cutover.

Existing deployments retain their legacy profile repository until activation. Run
Payload migrations before deploying the new editorial schema. Apply the product
identity migration immediately before coordinated activation because it revokes
legacy browser profile grants; do not leave legacy login active after that step.

Existing Supabase account suspensions are preserved during identity seeding;
provider migration does not grant roles or lift administrative bans.
