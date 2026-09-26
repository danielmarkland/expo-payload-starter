# expo-payload-starter

A production-oriented starter for a content-led product with one universal
authenticated application.

## Applications

- `apps/app` — Expo Router application for web, iOS, and Android.
- `apps/site` — Next.js public website, Payload CMS, preview, and admin UI.
- `packages/contracts` — stable Zod contracts shared across trust boundaries.
- `packages/core` — pure example-domain rules with no framework dependencies.
- `packages/auth` — provider-neutral identity and authorization interfaces.
- `packages/data` — typed Supabase repositories and generated database types.
- `packages/design-tokens` — framework-neutral design tokens.
- `packages/email` — typed React Email templates.
- `packages/config` — shared TypeScript settings and boundary enforcement.
- `supabase` — product database migrations, RLS policies, seeds, and functions.

## Requirements

- Node.js 22+
- pnpm 11
- Docker, for the local Supabase stack
- Supabase CLI

## Quick start

```sh
cp apps/app/.env.example apps/app/.env
cp apps/site/.env.example apps/site/.env
cp supabase/functions/.env.example supabase/functions/.env
pnpm install
supabase start
pnpm generate
pnpm dev
```

The public site runs on `http://localhost:3000`, Payload Admin on
`http://localhost:3000/admin`, and Expo on the port selected by Expo CLI.

## Production deployment

Deploy two Vercel projects from the same repository:

| Vercel project | Root directory | Build output             |
| -------------- | -------------- | ------------------------ |
| Website + CMS  | `apps/site`    | Next.js (automatic)      |
| Universal app  | `apps/app`     | `dist` (Expo web export) |

Create both projects in Vercel and set each root directory above. Allow each
project to include source files outside its root so pnpm can use the root
workspace and shared `packages/*`. The Deploy Button creates one Vercel
project; add the second separately. See
[Vercel's monorepo guide](https://vercel.com/docs/monorepos).

1. Create a Supabase project, link this repository, and apply the product
   migrations:

   ```sh
   supabase login
   supabase link --project-ref <project-ref>
   supabase db push --dry-run
   supabase db push
   ```

   In Supabase API settings, add `app` to the exposed schemas. Do not use
   `--include-seed` against production. Migrations create product tables, RLS
   policies, and the `app-uploads` and `cms-media` buckets.

2. Apply Payload's CMS migrations to the same database, before the first deploy
   and whenever CMS schema changes:

   ```sh
   DATABASE_URL='<production postgres connection string>' \
     pnpm --filter @starter/site payload migrate
   ```

   Run migrations from a trusted local shell or release job. Vercel builds do
   not apply database migrations automatically. Payload schema push is disabled
   to protect Supabase-owned tables.

3. Configure Vercel environment variables for the relevant environments:

   - Website + CMS: `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`,
     `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, and the five `SUPABASE_S3_*`
     values in `apps/site/.env.example`. Get the S3 endpoint, region, and
     server-only access keys from Supabase Storage settings. `RESEND_API_KEY`
     and sender values are optional unless using Payload email.
   - Universal app: `EXPO_PUBLIC_SUPABASE_URL`,
     `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `EXPO_PUBLIC_SITE_URL` from
     `apps/app/.env.example`. These are public build-time values; never use a
     Supabase secret key here.

4. In Supabase Auth URL settings, set the Site URL to the universal app's
   production URL and allow its exact `/auth/callback` URL. Add
   `expopayloadstarter://auth/callback` for native builds. Configure Google
   OAuth in Supabase and register Supabase's callback URL with Google. Add
   Vercel preview callback patterns only when previews need sign-in. See
   [Supabase redirect URL guidance](https://supabase.com/docs/guides/auth/redirect-urls).

5. If using the example email functions, set `RESEND_API_KEY`, `RESEND_FROM`,
   and `RESEND_WEBHOOK_SECRET` as Supabase function secrets. Deploy them with
   `supabase functions deploy send-welcome-email` and
   `supabase functions deploy resend-webhook`, then configure the matching
   Resend webhook URL.

## Fork checklist

- Replace the starter name, copy, logo, icons, and design tokens.
- Set a unique Expo `slug`, `scheme`, iOS bundle identifier, and Android
  package in `apps/app/app.json`.
- Create a Supabase project, apply migrations, expose the `app` schema, and set
  OAuth callback URLs for the Vercel app domain and native scheme.
- Create both Vercel projects, set their root directories and environment
  variables, then assign your domains.
- Replace or remove the example profile flow, migration, contract, core rule,
  repository, and Expo screen usage.
- Add your Resend domain and function secrets if you use the email examples.

See [docs/architecture.md](docs/architecture.md) and
[docs/database-ownership.md](docs/database-ownership.md) before adding a data
domain.

The profile flow is the included example domain. Forks can replace it by
removing its contract and rule from `contracts` and `core`, its repository from
`data`, the profile migration, and the profile query on the Expo home screen.
