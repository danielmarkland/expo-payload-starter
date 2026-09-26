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
pnpm --filter @starter/site payload migrate
pnpm generate
pnpm dev
```

The public site runs on `http://localhost:3000`, Payload Admin on
`http://localhost:3000/admin`, and Supabase Studio on `http://localhost:54323`.
`pnpm dev` starts the site and the Expo development server. To run the app in a
browser, use `pnpm --filter @starter/app web` instead of the app's Expo Go
server; it serves the app at `http://localhost:8081`. To run the site alongside
Expo web, start `pnpm dev:site` in another terminal.

The website is public. App sign-in uses Supabase Auth, while Payload Admin has
separate CMS user accounts. Creating a Payload user at `/admin` does not create
an app account, and app accounts do not grant CMS access.

The app's sign-in screen uses Google OAuth. Local Supabase does not enable this
provider until you configure it. Create a Google OAuth client and add
`http://127.0.0.1:54321/auth/v1/callback` as an authorized redirect URI in
Google. Add the following to `supabase/config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
```

Put the corresponding client ID and secret in a root `.env` file, which the
Supabase CLI reads for local config substitution and which must not be
committed:

```sh
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<your-google-client-id>
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<your-google-client-secret>
```

Restart the local stack after changing the config with `supabase stop` followed
by `supabase start`. The app callback URL is already allowed in the local
Supabase config. See [Supabase's local Google OAuth setup](https://supabase.com/docs/guides/auth/social-login/auth-google#local-development)
for details.

## Shared brand and theme

The shared source of truth is `packages/design-tokens/src/`: `tokens.json`
defines light/dark colors, Poppins weights, type sizes, line heights, spacing,
and radii; `brand.json` defines site/app titles, short name, description, and
asset names. Put app icons, web favicon, Android adaptive icon layers, splash
art, and font files in `packages/design-tokens/assets/`. Keep platform-specific
identity values such as Expo slug, URL scheme, and native package IDs in
`apps/app/app.config.js`.

Both the public site and Expo app default to the system appearance and track
system changes until a visitor manually switches theme. Manual choices are
remembered per browser/device. The site gets CSS variables generated from
`tokens.json`; regenerate them after token edits with
`pnpm --filter @starter/design-tokens generate:css`. `pnpm check` verifies the
generated CSS is current. Web and native components remain platform-specific,
but consume the same semantic design values.

The shared typography is Poppins (400, 500, 600, 700), with body text at 16px,
article text at 18px, eyebrow text at 12px, and responsive display/lede scales.
Spacing tokens run from 4px to 120px; shared radii are 10px, 14px, 18px, and
pill-shaped. The public content width is 1120px and article width is 760px.

| Role                  | Dark theme                       | Light theme                      |
| --------------------- | -------------------------------- | -------------------------------- |
| Page / section        | `#0F0F0F` / `#111111`            | `#FFFFFF` / `#F7F7F7`            |
| Card / raised         | `#161616` / `#222222`            | `#FFFFFF` / `#EEEEEE`            |
| Primary text          | `#FFFFFF`                        | `#231F20`                        |
| Body / muted text     | `#E8E8E8` / `#999999`            | `#333333` / `#666666`            |
| Borders               | `#1E1E1E`                        | `#E5E5E5`                        |
| Primary accent        | Green `#00C853`                  | Green `#00C853`                  |
| Secondary text accent | Cobalt `#1D4ED8`                 | Cobalt `#1D4ED8`                 |
| Danger / warning      | Red `#F44336` / yellow `#FACC15` | Red `#F44336` / yellow `#FACC15` |

Use green for primary actions and positive states, cobalt for secondary
emphasis, and red or yellow for error and warning states. Keep surfaces layered
subtly and use muted text for supporting information. Platform adapters are in
`apps/site/src/app/(frontend)/` and `apps/app/src/context/ThemeContext.tsx`;
change token values and brand assets in the shared package instead of editing
duplicated palettes.

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

- Replace the shared site/app names, short name, description, and asset references
  in `packages/design-tokens/src/brand.json`; update the files in
  `packages/design-tokens/assets/` with your logo, icons, splash art, and fonts.
- Customize colors, typography, spacing, radii, and layout tokens in
  `packages/design-tokens/src/tokens.json`, then regenerate the site CSS with
  `pnpm --filter @starter/design-tokens generate:css`.
- Set a unique Expo `slug`, `scheme`, iOS bundle identifier, and Android
  package in `apps/app/app.config.js`. These platform-specific identifiers are
  separate from the shared brand settings.
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
