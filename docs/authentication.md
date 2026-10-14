# Authentication

The public `@danielmarkland/auth-runtime` package supplies Better Auth, realm-scoped
PostgreSQL storage and browser/Expo clients. This starter hosts its own backend;
Groovepost-hosted frontend packages instead use the platform SDK session bridge.

Product customers use `/api/auth` and a customer realm from `app.identity_context`.
Editors use `/api/editor-auth` and the separate platform realm. Payload owns CMS
roles and only accepts explicitly linked `authIdentityId` accounts. Signing up
as a customer never grants editorial access. No client receives database or
provider secrets. CMS logout revokes the editorial identity session and expires
its cookies; the all-sessions option revokes that editor’s native sessions too.

## Configuration and independent administration

Better Auth is the sole customer and editorial identity provider. Set server `AUTH_SECRET` (at least 32 characters), explicit `SITE_URL` and `AUTH_TRUSTED_ORIGINS` including the Expo origin/native scheme. Product identity context is stored in `app.identity_context`; optional `AUTH_TENANT_ID` must match it. Expo receives only `EXPO_PUBLIC_SITE_URL`.

`pnpm run setup` generates this configuration and provisions two independent initial identities: a linked CMS administrator and a customer account with no CMS role. Their separate generated passwords are saved only in `.starter/administrator.json`. The operator command requires server/database access; it is never exposed as an HTTP signup route. Existing accounts, passwords, roles and content are preserved on rerun, and conflicting unlinked editorial identities require explicit reconciliation.

Initial verified accounts can sign in with passwords without an email provider. The shared `passwordSignIn: { disableSignUp: true }` option retains email-verification enforcement and disables public signup. The starter applies it to editors and to customers while email delivery is absent; normal customer signup becomes available only with verified email delivery configured. Without mail, recovery requires operator intervention. First-party Expo web origins are explicitly allowlisted for credentialed identity transport; arbitrary origins are never reflected. Native clients remain separate from editorial sessions.

Configure product `AUTH_GOOGLE_CLIENT_ID/SECRET`, `AUTH_FACEBOOK_CLIENT_ID/SECRET`, `AUTH_TWILIO_ACCOUNT_SID/AUTH_TOKEN/VERIFY_SERVICE_SID`, and `AUTH_EMAIL_API_KEY/FROM` as needed. Editorial credentials use the same suffixes under `EDITOR_AUTH_`. Provider callbacks are `SITE_URL/api/auth/callback/<provider>` and `SITE_URL/api/editor-auth/callback/<provider>`. Configure Twilio Verify and verified email senders before real delivery acceptance.

CMS users must explicitly link `authIdentityId` to the separate editorial realm. Product signup never assigns editorial roles. The operator-only `auth:migrate-editors` command creates reviewed editorial identities and sends reset links; it refuses conflicting unlinked identities. Do not run it without configured email delivery. Setup performs initial CMS administrator provisioning through this native identity and explicit link policy. Preserve existing IDs and provider subjects during source import; passwords and sessions require deliberate migration or reset.

Hosted provider login and outbound SMS/email require separate acceptance. A build, installed library or synthetic session is not evidence of live delivery.
