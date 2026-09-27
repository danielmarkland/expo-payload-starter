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
- Supabase CLI
- Vercel CLI, for guided production setup and deployment
- Docker, only for the full local Supabase development and test workflow

## Choose a setup path

For the shortest path to a hosted environment, install dependencies,
authenticate the provider CLIs, and run the guided production setup:

```sh
pnpm install
supabase login
vercel login
pnpm setup:production
```

This path does not require Docker. The wizard selects or creates hosted
Supabase and Vercel projects, applies migrations, and configures production
variables. See [Production deployment](#production-deployment) for its safety
boundaries and manual checkpoints.

Use the local path when developing database changes or running the complete
test suite. It provides an isolated Supabase/Postgres instance for Payload
integration tests, RLS tests, schema linting, generated-type verification, and
Playwright without touching hosted data.

## Local development

```sh
cp .env.example .env
cp apps/app/.env.example apps/app/.env
cp apps/site/.env.example apps/site/.env
cp supabase/functions/.env.example supabase/functions/.env
pnpm install
supabase start
pnpm payload:migrate
pnpm generate
pnpm dev
```

Do not point the local development or CI test configuration at production.
Several integration and end-to-end tests intentionally create, update, and
delete database records. A disposable local stack keeps those tests repeatable
and prevents concurrent runs from affecting shared data.

The public site runs on `http://localhost:3000`, Payload Admin on
`http://localhost:3000/admin`, and Supabase Studio on `http://localhost:54323`.
`pnpm dev` starts the site and the Expo development server. To run the app in a
browser, use `pnpm dev:app:web` instead of the app's Expo Go
server; it serves the app at `http://localhost:8081`. To run the site alongside
Expo web, start `pnpm dev:site` in another terminal.

### Common commands

| Command                              | Purpose                                                           |
| ------------------------------------ | ----------------------------------------------------------------- |
| `pnpm dev`                           | Start the Payload/Next site and Expo development server together. |
| `pnpm dev:site`                      | Start only the Payload/Next site.                                 |
| `pnpm dev:app`                       | Start only the Expo development server.                           |
| `pnpm dev:app:web`                   | Start the Expo app in a web browser.                              |
| `pnpm payload:migrate`               | Apply pending Payload database migrations.                        |
| `pnpm payload:migrate:status`        | Show applied and pending Payload migrations.                      |
| `pnpm payload:migrate:create <name>` | Generate a Payload migration after changing its schema.           |
| `pnpm generate:payload`              | Regenerate Payload types and the admin import map.                |
| `pnpm setup:production`              | Configure Supabase and Vercel production projects interactively.  |
| `pnpm check`                         | Run all checks and builds; requires the local Supabase stack.     |

The public homepage is a Payload Page with the slug `home`. After the first
Payload migration, open `/admin`, create a Page with that slug, compose its
sections using the available blocks, and publish it. Additional Pages render
at `/<slug>`. Add a **Latest posts** block wherever you want published Posts
to appear. Pages and Posts support drafts; use Payload's Preview action to
preview unpublished content. Configure editor-managed header and footer links
in **Header navigation** and **Footer navigation** Globals. **Site settings**
holds the site/app titles, short name, light/dark logos, favicon, fallback SEO
description, social preview metadata, and runtime theme. Header navigation owns
only the header links. Header links can use a
curated set of Lucide icons; icon-only links retain their configured label for
assistive technology. The built-in Search link can be hidden or replaced with
any curated icon from the same Header navigation settings. Footer navigation
remains text links.

Posts can be assigned an Author, Categories, and Tags. Their public archives
are available at `/authors/<slug>`, `/categories/<slug>`, and `/tags/<slug>`;
the blog index is `/posts`. Payload's SEO fields support search/social titles,
descriptions, and preview images. Editors can manage 301/302 redirects in the
**Redirects** collection. The site search is at `/search`, and public pages and
posts are listed in `/sitemap.xml`; `/robots.txt` excludes the CMS and search
results from indexing. After adding search to an existing database, open the
**Search** collection in `/admin` and run **Reindex** once to index existing
published content. New publishes and edits are indexed automatically.

Google Tag Manager is optional and configured independently for each web
surface: set `NEXT_PUBLIC_GTM_CONTAINER_ID` in `apps/site/.env` for the public
website, and `EXPO_PUBLIC_GTM_CONTAINER_ID` in `apps/app/.env` for Expo web.
Use a container ID such as `GTM-ABC123`; these are public build-time values,
not secrets. The site container does not load in Payload Admin, and the Expo
container only runs in the browser—not in native iOS or Android apps. Configure
consent and SPA page-view behavior in the relevant GTM container.

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

## Environment variables and secrets

Copy the relevant `.env.example` files shown in [Quick start](#quick-start).
Keep real values in ignored `.env` files locally and in the hosting provider's
secret store in production. Never commit secrets. The **Handling** column
identifies secrets explicitly. Variables beginning with `NEXT_PUBLIC_` or
`EXPO_PUBLIC_` are embedded in web/client builds: only put public configuration
there, never a password, private key, or service-role credential. See
[Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables),
[Expo environment variables](https://docs.expo.dev/guides/environment-variables/),
and [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

### Website and Payload (`apps/site/.env`)

| Variable                         | Handling      | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                   | **Secret**    | Required server-only Postgres connection string for Payload; it contains database credentials. Use the local value in development. For hosted Vercel setup, copy the **Session pooler** URI from the same Supabase project's **Connect** panel (port `5432`). Use a connection to that same database for Payload migrations; never construct the host or use a URI from another project. See [Supabase's connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres). |
| `PAYLOAD_SECRET`                 | **Secret**    | Required server-only Payload signing/encryption secret. Generate a unique random value of at least 32 characters; do not reuse it elsewhere.                                                                                                                                                                                                                                                                                                                                                  |
| `PREVIEW_SECRET`                 | **Secret**    | Required independent server-only secret used to authorize draft preview links. Generate a strong random value and keep it separate from `PAYLOAD_SECRET`.                                                                                                                                                                                                                                                                                                                                     |
| `NEXT_PUBLIC_APP_URL`            | Public config | Public URL of the Expo app; used for site links and Payload's allowed app origin. Local default: `http://localhost:8081`.                                                                                                                                                                                                                                                                                                                                                                     |
| `NEXT_PUBLIC_SITE_URL`           | Public config | Public site URL used for Payload's allowed origin and preview links. Local default: `http://localhost:3000`.                                                                                                                                                                                                                                                                                                                                                                                  |
| `NEXT_PUBLIC_GTM_CONTAINER_ID`   | Public config | Optional public Google Tag Manager container ID (`GTM-…`) for the public website; leave empty to disable. Configure consent and page-view behavior in [Tag Manager](https://support.google.com/tagmanager/answer/6103696).                                                                                                                                                                                                                                                                    |
| `RESEND_API_KEY`                 | **Secret**    | Optional server-only Resend API key for Payload email. Create/manage it in [Resend API keys](https://resend.com/docs/dashboard/api-keys).                                                                                                                                                                                                                                                                                                                                                     |
| `EMAIL_FROM_ADDRESS`             | Public config | Optional Payload sender email address (example default `hello@example.com`). Verify the sender domain in Resend before production sending; see [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction).                                                                                                                                                                                                                                                          |
| `EMAIL_FROM_NAME`                | Public config | Optional display name paired with `EMAIL_FROM_ADDRESS`; example default is `Daniel Markland`.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `CONTACT_TO_ADDRESS`             | **Secret**    | Recipient for public website contact-form submissions. Kept server-side so the address is not exposed in the browser.                                                                                                                                                                                                                                                                                                                                                                         |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public config | Cloudflare Turnstile site key used by the public contact form.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `TURNSTILE_SECRET_KEY`           | **Secret**    | Server-only Cloudflare Turnstile secret used to verify contact submissions.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `SUPABASE_S3_ACCESS_KEY_ID`      | **Secret**    | Server-only Supabase Storage S3 credential for Payload media uploads. Create an S3 access-key pair in Storage settings; these credentials bypass RLS and must never reach a client.                                                                                                                                                                                                                                                                                                           |
| `SUPABASE_S3_SECRET_ACCESS_KEY`  | **Secret**    | Secret half of the S3 credential pair above; keep server-only.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `SUPABASE_S3_ENDPOINT`           | Public config | Supabase Storage S3 endpoint. Local default is `http://127.0.0.1:54321/storage/v1/s3`; copy the hosted endpoint from the project's S3 settings.                                                                                                                                                                                                                                                                                                                                               |
| `SUPABASE_S3_REGION`             | Public config | S3 signing region. Local default is `local`; use the region shown in the project's S3 settings.                                                                                                                                                                                                                                                                                                                                                                                               |
| `SUPABASE_S3_BUCKET`             | Public config | Bucket used for Payload media; default is `cms-media`, created by the project migrations.                                                                                                                                                                                                                                                                                                                                                                                                     |

See [Supabase Storage S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication) for S3 credentials and connection details. The access key ID and secret are strictly server-side.

If a secret is accidentally exposed, rotate it with its provider, update every
environment that uses it, then redeploy. Do not paste database URLs or other
credentials into issues, chat, or logs.

### Universal app (`apps/app/.env`)

| Variable                               | Handling      | Purpose                                                                                                                        |
| -------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`             | Public config | Public Supabase project URL; local default is `http://127.0.0.1:54321`.                                                        |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public key    | Supabase publishable key, designed for client use; protect data with RLS. Never substitute a Supabase secret/service-role key. |
| `EXPO_PUBLIC_SITE_URL`                 | Public config | Public website URL used by the app; local default is `http://localhost:3000`.                                                  |
| `EXPO_PUBLIC_GTM_CONTAINER_ID`         | Public config | Optional public GTM container ID for Expo web only; leave empty to disable. It is not loaded by native iOS/Android builds.     |

These public values are safe to bundle only because access is governed by
Supabase Auth and RLS. Do not put server credentials in Expo's public
environment variables.

### Google OAuth (`.env` at repository root)

| Variable                                  | Handling      | Purpose                                                                      |
| ----------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | Public config | Google OAuth client ID referenced by `supabase/config.toml`; not a password. |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`    | **Secret**    | Google OAuth client secret; keep private and use only for Supabase Auth.     |

These root variables are read by the Supabase CLI for `env(...)` substitutions
in `supabase/config.toml`. Set the matching Google OAuth client and callback as
described in [Supabase's Google provider setup](https://supabase.com/docs/guides/auth/social-login/auth-google#local-development).
The root `.env` is distinct from `supabase/functions/.env` below.

### Supabase Edge Functions (`supabase/functions/.env`)

| Variable                | Handling      | Purpose                                                                                                                                                          |
| ----------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`        | **Secret**    | Server-only Resend API key used by the example email function. This is separate from the site's `RESEND_API_KEY`; configure it in each runtime that sends email. |
| `RESEND_FROM`           | Public config | Sender identity for the Edge Function, in `Name <email@example.com>` form; verify its domain with Resend. Separate from Payload's `EMAIL_FROM_*` settings.       |
| `RESEND_WEBHOOK_SECRET` | **Secret**    | Server-only signing secret for the Resend webhook; copy it from that webhook's details in Resend.                                                                |

For local development, `supabase start` loads this file. In a hosted Supabase
project, set these with [`supabase secrets set`](https://supabase.com/docs/guides/functions/secrets).
Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` to Edge Functions automatically; do not add them
to the example file or set them manually. `SUPABASE_URL` is public config,
`SUPABASE_ANON_KEY` is a public key intended for client use with RLS, and
`SUPABASE_SERVICE_ROLE_KEY` is a **secret** privileged key that must remain
server-side. See [Edge Function secrets and default variables](https://supabase.com/docs/guides/functions/secrets).

### Vercel deployment

Set the Website + CMS variables in the Vercel Website project, and the Expo
variables in the separate Universal app project. Use Vercel's Production,
Preview, and Development scopes as appropriate; configure public URLs and GTM
IDs per project/environment. Add optional email and S3 credentials only when
using those features. Vercel applies environment changes to new deployments,
so redeploy after changing a value. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

## Runtime brand and theme

Each deployment stores its identity and curated theme in Payload's **Site
settings** Global. Editors can choose the default appearance, whether visitors
may switch modes, font/shape/density presets, and the primary semantic colors
for light and dark modes. Separate header logos can be uploaded for each mode;
when a mode has no logo, the header uses the site title. The public site renders
these settings server-side as CSS variables. The Expo app fetches the validated
public `/api/site-config` contract at launch and whenever it returns to the
foreground, caches the last valid response, and uses packaged defaults while
offline.

Use a separate Payload database for each independently branded Vercel project.
That lets multiple projects deploy the same Git branch while keeping their
content, media, identity, and theme isolated. Set `EXPO_PUBLIC_SITE_URL` to the
matching website so each app reads the correct public configuration. Native app
icons, splash artwork, Expo slug/scheme, and iOS/Android identifiers remain
build-time values and require an app build when changed.

## Packaged design defaults

The fallback source of truth is `packages/design-tokens/src/`: `tokens.json`
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

| Role                | Dark theme                       | Light theme                      |
| ------------------- | -------------------------------- | -------------------------------- |
| Page / section      | `#0F0F0F` / `#111111`            | `#FFFFFF` / `#F7F7F7`            |
| Card / raised       | `#161616` / `#222222`            | `#FFFFFF` / `#EEEEEE`            |
| Primary text        | `#FFFFFF`                        | `#231F20`                        |
| Body / muted text   | `#E8E8E8` / `#999999`            | `#333333` / `#666666`            |
| Borders             | `#1E1E1E`                        | `#E5E5E5`                        |
| Primary brand color | Gold `#EEC784`                   | Gold `#EEC784`                   |
| Secondary emphasis  | Warm stone `#D2C7B8`             | Taupe `#6E685D`                  |
| Soft accent surface | `#40382B`                        | Cream `#F0E3CC`                  |
| Primary action text | `#121212`                        | `#121212`                        |
| Danger / warning    | Red `#F44336` / yellow `#FACC15` | Red `#F44336` / yellow `#FACC15` |

Use gold for primary actions and key highlights, with dark text on gold for
contrast. Use taupe/warm stone for secondary emphasis and cream for soft
highlights. Secondary and soft-surface tones adapt to each mode for legibility;
keep red or yellow for error and warning states. Keep surfaces layered subtly
and use muted text for supporting information. Platform adapters are in
`apps/site/src/app/(frontend)/` and `apps/app/src/context/ThemeContext.tsx`;
change token values and brand assets in the shared package instead of editing
duplicated palettes. The brand accents are based on the primary and secondary
colors configured on [danielmarkland.com](https://danielmarkland.com/).

## Production deployment

Deploy two Vercel projects from the same repository:

| Vercel project | Root directory | Build output             |
| -------------- | -------------- | ------------------------ |
| Website + CMS  | `apps/site`    | Next.js (automatic)      |
| Universal app  | `apps/app`     | `dist` (Expo web export) |

### Guided setup

Install the
[Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
and [Vercel CLI](https://vercel.com/docs/cli), then authenticate both:

```sh
# macOS; use the linked installation guides for other platforms
brew install supabase/tap/supabase
pnpm add --global vercel

supabase login
vercel login
```

Run the production setup wizard from the repository root:

```sh
pnpm setup:production
```

The wizard can select or create the Supabase project and both Vercel projects.
It links the repository, previews and applies Supabase product migrations,
applies Payload CMS migrations to the same database, configures production-only
Vercel variables, and offers optional Google OAuth, email, Turnstile, and GTM
setup. It shows a redacted summary and asks again before migrations, hosted
Auth changes, replacing existing secrets, or production deployment.

Supabase currently requires one dashboard step for Payload media storage. When
the wizard pauses, open **Storage → S3**, enable the S3 protocol, generate an
access-key pair, and paste both values into the hidden prompts. When enabling
Google sign-in, register the callback URL printed by the wizard in Google Cloud
before continuing. Secret values are piped directly to their destination and
are not written to the repository.

Preview deployments are intentionally not given production credentials. Give
previews an isolated Supabase project or Supabase Branching configuration
before enabling authenticated or CMS-backed previews. Inspect the complete
plan without making remote changes using:

```sh
pnpm setup:production -- --dry-run
```

The command is safe to rerun. It preserves existing sensitive Vercel variables
unless you explicitly approve their replacement and updates public production
configuration after showing the planned values. Vercel environment changes
only affect new deployments, so accept the final deployment prompt or redeploy
both projects afterward.

### Manual project linking

For an existing Vercel monorepo, link each application directory to its
corresponding project:

```sh
vercel link --cwd apps/site --project <website-project> --team <team-slug>
vercel link --cwd apps/app --project <app-project> --team <team-slug>
```

The generated `.vercel/` directories are ignored. Verify each association and
its configured root directory with:

```sh
vercel project inspect --cwd apps/site
vercel project inspect --cwd apps/app
```

The Website + CMS project must use `apps/site` with the Next.js preset. The
Universal app project must use `apps/app`, `pnpm build`, and output directory
`dist`. Projects created by the wizard are also connected to the current
`origin` Git remote. See [Vercel's monorepo guide](https://vercel.com/docs/monorepos).

For manual database delivery, link the production project, preview the product
migrations, and then apply both migration owners in order:

```sh
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push
DATABASE_URL='<session-pooler-connection-string>' pnpm payload:migrate
```

Never use `--include-seed` against production. Supabase migrations own product
tables, RLS, and storage buckets; Payload migrations own the CMS tables.
Payload schema push remains disabled, and Vercel builds do not apply either
migration set automatically.

### Production troubleshooting

Check runtime logs when a production page is blank or returns a server error.
With the Vercel CLI, use
`vercel logs <deployment-url> --since 30m --status-code 5xx --expand`, or open
the project's **Logs** view in Vercel. See the [`vercel logs` reference](https://vercel.com/docs/cli/logs).

| Log message                                                                       | Likely cause and next step                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getaddrinfo ENOTFOUND` for a Supabase database host                              | The hostname in `DATABASE_URL` does not resolve. Copy the Session pooler URI from the correct Supabase project's **Connect** panel; do not type or infer the hostname.                                               |
| `relation "cms_posts" does not exist` (or another `cms_*` / `payload_*` relation) | Payload migrations have not been applied to the database the deployment uses, or they ran against a different database. Run `payload migrate` with the matching `DATABASE_URL`, then check `payload migrate:status`. |
| The old error persists after changing a Vercel variable                           | Verify the variable is assigned to the correct Vercel project and environment, then create a new deployment. Existing deployments retain their previous environment values.                                          |
| `No email adapter provided`                                                       | Payload email is not configured. This is expected if Payload email is unused; otherwise set the site's Resend key and sender variables.                                                                              |
| Upload storage adapter warning for `media`                                        | Supabase S3 settings/credentials are missing or disabled. Configure the site's `SUPABASE_S3_*` values before relying on production media uploads.                                                                    |

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
