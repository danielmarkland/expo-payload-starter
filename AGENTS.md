# expo-payload-starter

Read `docs/architecture.md` before changing application boundaries, database
ownership, authentication, storage, or email delivery.

- Use pnpm from the repository root.
- Keep product identity and data in Supabase; keep editorial content in Payload.
- Never expose service-role, Payload database, S3, or Resend credentials to a client.
- Add or update tests with behavior changes.
- Run `pnpm check` before submitting changes.
