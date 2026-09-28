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
- Vercel CLI, for guided hosted setup and deployment
- Docker, only for the full local Supabase development and test workflow

## Choose a setup path

For the shortest path to a hosted environment, install dependencies,
authenticate the provider CLIs, and run the guided setup:

```sh
pnpm install
supabase login
vercel login
pnpm setup:hosted
```

This path does not require Docker. The wizard supports a landing site, a
single-environment app, or separate hosted development and production
environments. It selects or creates Supabase and Vercel resources, applies
migrations, and configures environment variables. See
[Hosted environments and deployment](#hosted-environments-and-deployment) for
its safety boundaries and manual checkpoints.

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
| `pnpm setup:hosted`                  | Configure Supabase and Vercel environments interactively.         |
| `pnpm setup:production`              | Run the backward-compatible single-app production setup.          |
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

Every Page block includes a collapsed **Appearance** group. Editors can choose
responsive design-system presets for top/bottom padding and margin, content
width, background, borders, and rounded corners without writing CSS. Leaving a
control blank preserves that block's site default. Pages also include an
**Advanced presentation → Custom page CSS** Monaco editor as a trusted-editor
escape hatch. Scope custom selectors beneath `[data-page="page-slug"]`; prefer
the Appearance controls so pages remain responsive and visually consistent.

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

## Theme system and design workflow

This section is the implementation contract for people and agents designing a
site from this starter. Use it during design, not only after mockups are
approved: every proposed page should map to the theme controls and Payload
content model below, or identify the reusable capability that must be added.

### Sources of truth and precedence

The design system has four layers. Prefer the highest layer that can express a
requirement without making the design less coherent.

1. **Payload Site settings** hold deployment-specific identity and curated
   runtime theme values. These override the packaged defaults and are the right
   place for most rebrands.
2. **Page content and Appearance controls** compose pages from supported blocks
   and apply responsive spacing, width, and surface variants without custom
   code.
3. **Page-scoped custom CSS** is a trusted-editor escape hatch for an isolated
   presentation requirement. Scope every selector beneath
   `[data-page="page-slug"]`; do not use it to create a second design system.
4. **Packaged design tokens and assets** are fallbacks and shared application
   defaults. Change them when a value must be available before Payload loads or
   across both the website and universal app.

The public site renders Site settings server-side as CSS variables. The Expo
app fetches the validated public `/api/site-config` contract at launch and when
it returns to the foreground, caches the last valid response, and uses packaged
defaults while offline. Web and native components remain platform-specific but
consume the same semantic design values.

Use a separate Payload database for each independently branded Vercel project.
That keeps content, media, identity, and theme isolated even when projects
deploy the same Git branch. Point `EXPO_PUBLIC_SITE_URL` at the matching website
so the app reads the correct public configuration.

### Runtime theme capabilities

Payload's **Site settings** Global manages the site/app titles, short name,
description, favicon, mode-specific header logos, and the following theme
controls:

| Control        | Supported values                            | Design effect                                                                  |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| Default mode   | System, light, dark                         | Initial appearance when the visitor has no saved preference.                   |
| Visitor toggle | Allowed or hidden                           | Whether visitors may override the default; choices persist per browser/device. |
| Font preset    | Poppins, system sans                        | Runtime font family for both web and app.                                      |
| Shape preset   | Square, soft, rounded                       | Scales non-pill radii to `0`, `1`, or `1.5` times the packaged values.         |
| Density preset | Compact, comfortable, spacious              | Scales the spacing system to `0.8`, `1`, or `1.2` times the packaged values.   |
| Light palette  | Eight required six-digit hexadecimal colors | Curated semantic colors for light mode.                                        |
| Dark palette   | Eight required six-digit hexadecimal colors | Curated semantic colors for dark mode.                                         |

Each mode exposes only `primary`, `primaryInk`, `accent`, `surface`,
`surfaceRaised`, `ink`, `inkMuted`, and `border`. Primary is the dominant action
color; Accent supports links, highlights, focus indicators, and decoration.
The runtime resolver derives hover, soft accent, input, footer, section,
strong-line, and supporting-text colors from those eight values. A design brief
should therefore specify semantic roles, not a separate arbitrary color for
every component. Payload enforces WCAG AA contrast for the core text and
background pairs in both modes.

When a mode-specific logo is absent, the header displays the site title. Native
app icons, splash artwork, Expo slug/scheme, and iOS/Android identifiers are
build-time values and require a new app build; they are not runtime Site
settings.

### Packaged defaults

The fallback source of truth is `packages/design-tokens/src/`. `tokens.json`
defines light/dark colors, Poppins weights, type sizes, line heights, spacing,
radii, and layout widths. `brand.json` defines titles, short name, description,
the theme preference key, and asset names. Shared images and fonts belong in
`packages/design-tokens/assets/`; platform-specific identifiers remain in
`apps/app/app.config.js`.

The shared typography is Poppins (400, 500, 600, 700), with body text at 16px,
article text at 18px, eyebrow text at 12px, and responsive display/lede scales.
Spacing tokens run from 4px to 120px. Base radii are 10px, 14px, 18px, and pill;
layout widths are 1120px for general content, 800px for hero copy, 700px for
narrow copy, 760px for articles, and 460px for cards, with a 260px card minimum.

| Role                | Dark default                     | Light default                    |
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

After editing packaged tokens, run
`pnpm --filter @starter/design-tokens generate:css`. `pnpm check` verifies that
the generated CSS is current. Change shared tokens instead of duplicating
palette values inside platform components.

### Page composition capabilities

Pages are ordered arrays of Payload blocks. Use the existing block whose
content semantics match the design; do not choose a block only because its
current styling happens to look similar. Every block also supports an optional
in-page anchor and eyebrow; anchors target the section wrapper, and eyebrows
appear above the section content.

| Block          | Intended use                              | Supported content and variants                                                                 |
| -------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Hero           | Primary or secondary page introduction    | Eyebrow, rich headline with accent spans, secondary heading, body, two links, image.           |
| Rich text      | Editorial copy                            | Optional heading and Lexical rich text.                                                        |
| Image          | Standalone editorial image                | Media upload and optional caption.                                                             |
| Feature grid   | Repeated benefits or capabilities         | Eyebrow, heading, intro, card or stacked layout, title/description items, and optional action. |
| Split content  | Copy paired with media                    | Anchor, eyebrow, heading, rich text, image, left/right image position, and optional action.    |
| Link grid      | Resource or destination list              | Anchor, heading content, label/URL items, and optional action.                                 |
| Portfolio grid | Projects, people, or case-study summaries | Anchor, heading content, name/role/description/URL cards, and optional action.                 |
| Call to action | Focused conversion prompt                 | Heading, body, and one required action.                                                        |
| Testimonials   | Social proof                              | Optional heading and quote/name/role items.                                                    |
| Logo cloud     | Clients, partners, or tools               | Anchor, heading, intro, and linked logo uploads.                                               |
| Contact form   | Built-in contact workflow                 | Anchor, eyebrow, heading, body, submit label, and success message.                             |
| Statistics     | Compact quantitative proof                | Optional heading and value/label items.                                                        |
| FAQ            | Expandable questions                      | Optional heading and question/answer items.                                                    |
| Latest posts   | Dynamic published-post listing            | Optional heading and a limit from 1 through 12.                                                |

Every block includes an optional **Appearance** group:

- Top and bottom padding: none, small, medium, large, or extra large.
- Top and bottom margin: none, small, medium, large, or extra large; blank also
  preserves the default of no margin.
- Content width: site default, narrow text, viewport-wide, or full viewport.
- Background: default, raised surface, primary accent, or fixed dark treatment.
- Top border: default, none, or accent; bottom border: none, default, or accent.
- Rounded container: on or off, using the active shape preset.

Appearance values are presets rather than arbitrary CSS measurements and remain
responsive automatically. Blank controls preserve each block's design-system
default. The fixed dark background intentionally stays dark in either mode;
use it only when the design calls for a mode-independent dark section.

Other CMS-owned design surfaces are **Header navigation**, **Footer navigation**,
Media, Pages, Posts, Authors, Categories, Tags, Redirects, and SEO metadata.
Header links support a curated Lucide icon set, optional icon-only display, and
an optional sticky header; footer links are text-only. Post SEO images also
serve as featured images on article and listing views. Editors can enable a
generated table of contents for an individual post; it links level-two and
level-three headings. Content designs must account for draft/preview behavior
and use Media relationships rather than embedding untracked asset URLs.

### Design brief for agents

Before producing a visual direction, collect or explicitly mark assumptions for:

- Product purpose, target audience, primary conversions, and accessibility
  requirements.
- Page inventory, navigation hierarchy, content status, and which content must
  remain editor-managed.
- Brand personality, reference designs, required light/dark behavior, font and
  density preferences, and approved colors.
- Available logos, icons, photography, illustrations, and their usage rights,
  crops, alt text, and mode-specific variants.
- Responsive priorities, expected content extremes, and whether the Expo app
  must share the change.

An implementation-ready design handoff must include:

1. A Site settings manifest containing identity, mode behavior, presets, and
   the seven semantic colors for both modes.
2. A page-by-page block map with real or clearly labeled placeholder content,
   block order, Appearance values, anchors, links, and media requirements.
3. Header/footer navigation, SEO metadata, redirects, and shared content that
   the design assumes.
4. Desktop and mobile behavior, focus/hover states, content-overflow cases, and
   contrast expectations for both modes.
5. A capability-gap list classifying every unmet requirement as a new reusable
   block, a field on an existing block, a semantic theme token, renderer/CSS
   behavior, or a platform-specific change.

Prefer the existing system, but do not distort a design to avoid a justified
extension. New capabilities must be semantic and reusable: update the Payload
configuration, renderer, styles, generated types, tests, and migration together.
A one-page visual exception usually belongs in scoped custom CSS; repeated or
editor-controlled behavior belongs in the schema and renderer.

### Agent prompt examples

Use this prompt to generate a design direction that is constrained by the
starter before implementation begins:

```text
Generate a responsive site mockup for [organization/product] that conforms to
the theme system and Payload page-building capabilities documented here:
https://github.com/danielmarkland/expo-payload-starter/blob/main/README.md#theme-system-and-design-workflow

Goals and audience:
- [primary audience]
- [business/user goal]
- [primary conversion]

Brand and content inputs:
- [brand personality and visual references]
- [required pages and navigation]
- [available copy, logo, imagery, and other assets]
- [light/dark preference and accessibility requirements]

Use only the documented Site settings, semantic colors, presets, existing
Payload blocks, and block Appearance options. Design desktop and mobile states
and show both light and dark modes when both are enabled. Do not invent CMS
fields or components. If a requirement cannot be represented, list it as a
capability gap instead of silently adding a new primitive.

Alongside the mockup, provide the Site settings manifest, page-by-page block
map, Appearance values, navigation/SEO assumptions, asset list, responsive and
interaction notes, and any capability gaps described by the README.
```

Use this prompt to assess an existing site built with Elementor or another page
builder before promising design parity or estimating a migration:

```text
Audit [existing site URL] for conversion into this repository. The target theme
system, Payload content model, and migration rules are documented here:
https://github.com/danielmarkland/expo-payload-starter/blob/main/README.md#theme-system-and-design-workflow

This is a read-only discovery and gap-analysis task. Do not modify the source
site or target repository. Inspect the publicly accessible site and any supplied
sitemap, CMS export, analytics, design files, or content inventory. State what
you could not access and do not infer hidden pages or functionality as fact.

Inventory and quantify:
- Unique public URLs, page templates, recurring sections/widgets, posts and
  taxonomies, navigation items, forms, search, redirects, and integrations.
- Site identity, fonts, semantic colors, spacing/shape patterns, light/dark
  behavior, responsive breakpoints, interactive states, and reusable assets.
- Images, video, downloadable files, embeds, structured data, SEO metadata,
  analytics, consent tooling, and accessibility concerns.
- Elementor or other builder-specific widgets, global styles, templates,
  shortcodes, plugins, and dynamic-content dependencies.

Map every discovered page and recurring section to an existing Payload block,
Appearance setting, Site setting, collection, or Global. Classify each item as:
1. Direct fit: can be represented without design or content changes.
2. Adaptation: supported after an explicitly described content/layout change.
3. Extension: requires a reusable block, field, semantic token, renderer/style
   behavior, integration, or platform change.
4. Excluded/manual: should not be migrated automatically, with the reason.

Produce two coordinated reports:

Client impact summary:
- Executive summary of expected visual/content parity and notable compromises.
- Counts and percentages for pages and recurring sections in each fit category.
- A table of visible differences, lost or changed behavior, client decisions,
  content/asset work, SEO or redirect risk, and third-party dependencies.
- A phased estimate using relative sizes (S/M/L/XL) and explicit assumptions;
  separate discovery, reusable template work, content migration, manual QA, and
  client review instead of inventing precise hours without evidence.

Technical conversion appendix:
- URL-by-URL inventory and proposed target slug/template.
- Source component/widget to target block mapping, including occurrence counts.
- Proposed Site settings manifest and shared navigation/content structures.
- Exact capability gaps and the minimum target changes needed for each one,
  naming affected Payload schemas, renderers/styles, contracts, assets, tests,
  and schema migrations where applicable.
- Content migration plan using stable keys and Payload Local APIs, including
  media acquisition, relationship resolution, drafts/publication status,
  idempotency, non-destructive rollback, and what requires manual entry.
- Redirect and SEO preservation plan plus responsive, accessibility, form, and
  integration test coverage.
- Risks, blockers, unanswered questions, and a recommended implementation order.

End with a reconciliation table whose totals match the inventories above, so
the technical scope and client-facing quantities cannot drift apart. Cite the
source URL or supplied artifact for every material finding.
```

After a mockup is approved, use this prompt to implement its editable Payload
content without adding custom presentation components:

```text
Implement the approved site design at [mockup or design link] in this
repository. Follow the theme system, content model, and migration workflow in:
https://github.com/danielmarkland/expo-payload-starter/blob/main/README.md#theme-system-and-design-workflow

Use only existing Payload blocks, their Appearance controls, existing Globals,
and current renderer behavior. Do not add or modify React components, Payload
blocks or fields, design tokens, or page custom CSS. If part of the design does
not fit those constraints, report the mismatch and adapt it to the closest
existing semantic block rather than extending the system.

Create a separate idempotent Payload data migration that applies the approved
Site settings, header/footer navigation, Pages, block content, SEO metadata,
and redirects. Use Payload Local APIs with the migration req, resolve records
by stable keys such as slug, preserve unrelated editor data, set publication
status deliberately, and do not invent Media IDs. Use committed assets when
they can be uploaded safely; otherwise leave a clearly documented editor upload
step. Use a non-destructive no-op down migration unless rollback can restore
data losslessly.

Regenerate Payload types/import maps if required, run migration status and the
repository checks, and verify the result in light/dark modes and mobile/desktop
sizes. Report any missing content, assets, or unsupported design details.
```

### Payload schema and content migrations

Payload owns the `public.cms_*` and `public.payload_*` tables. Never alter those
tables in a Supabase migration, and do not hand-author SQL from a mockup before
changing the Payload configuration.

For a design that changes the content model:

1. Update the relevant Global, collection, or block configuration and its
   renderer/styles first.
2. Run `pnpm generate:payload` to refresh Payload types and the admin import map.
3. Run `pnpm payload:migrate:create <name>` to generate the Payload schema
   migration and snapshot; review both the live and version/draft tables.
4. Add or update focused tests for schema validation, theme resolution, and
   rendering behavior, then run the migration against a fresh local database
   and an existing database with representative content.

Deliver approved initial Pages, navigation, and Site settings in a separate,
idempotent Payload data migration. Once the schema snapshot is current, run
`pnpm payload:migrate:create <name>` again and accept Payload's prompt to create
a blank migration, then add the data operations to its generated TypeScript
file and retain its snapshot and index entry. Use the migration's `payload`
Local API and pass its `req` to every operation so writes participate in the
migration transaction:

- Find documents by stable unique keys such as Page slug; create missing
  documents and update only the fields explicitly owned by the approved design.
- Use partial `payload.updateGlobal` calls for Site settings and navigation so
  unrelated Global fields are preserved. Replacing a navigation items array is
  intentional ownership of that entire array and must be stated in the design
  handoff.
- Set draft/published status deliberately. Do not silently publish placeholder
  copy or incomplete assets.
- Never assume database IDs are portable. Resolve relationships by stable
  fields, upload committed assets through Payload when suitable, or document a
  required editor upload instead of inventing a Media ID.
- Make reruns converge without duplicate documents. Preserve unrelated editor
  records and do not reset a collection or Global wholesale.
- Prefer a documented no-op `down` for content/settings when rollback would
  delete or overwrite editor work. Reverse data only when the migration can
  prove ownership and restore the previous value losslessly.

Afterward, run `pnpm payload:migrate:status`, preview the affected Pages in both
modes and at mobile/desktop widths, and run `pnpm check`. Schema and data
migrations must work in local, development, and production Payload databases;
they must not copy environment-specific users, drafts, media, or credentials
between environments.

## Hosted environments and deployment

The starter recognizes three environment roles:

| Environment | Supabase                     | Vercel                                                  | Purpose                                           |
| ----------- | ---------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| Local       | CLI/Docker stack             | Local Next.js and Expo servers                          | Database development and the complete test suite  |
| Development | Persistent Supabase branch   | Preview variables scoped to a selected Git branch       | Long-lived hosted integration work before release |
| Production  | Main hosted Supabase project | Production variables and the selected production branch | Public site and released app                      |

Supabase Branching requires a Pro-plan project. Free-tier projects can use the
Landing or Single-environment app profiles with local development. The staged
profile uses a persistent branch without production data and requires separate
branch credentials, Payload content, users, and media.

The guided wizard offers these profiles:

| Profile                | Production                   | Hosted development                                                                            |
| ---------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| Landing site           | Website + Payload            | None                                                                                          |
| Single-environment app | Website + Payload + Expo web | None                                                                                          |
| Staged app             | Website + Payload            | Website + Payload + Expo web on a persistent Supabase branch and branch-scoped Vercel Preview |

Deploy two Vercel projects from the same repository:

| Vercel project | Root directory | Build output             |
| -------------- | -------------- | ------------------------ |
| Website + CMS  | `apps/site`    | Next.js (automatic)      |
| Universal app  | `apps/app`     | `dist` (Expo web export) |

The Landing profile creates only the Website + CMS project. The other profiles
use both projects; in the Staged profile, the app project receives no
production credentials or custom production domain until a later release.

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

Run the hosted setup wizard from the repository root:

```sh
pnpm setup:hosted
```

You can also select a profile non-interactively while retaining the wizard's
resource and confirmation prompts:

```sh
pnpm run setup -- --profile landing
pnpm run setup -- --profile single-app
pnpm run setup -- --profile staged
```

`pnpm setup:production` remains an alias for the `single-app` profile. The
wizard can select or create the production Supabase project and required Vercel
projects. For staged deployments it also creates or selects a persistent
Supabase branch associated with user-selected development and production Git
branches. Vercel development variables use Preview scope restricted to the
development branch, which works without a Vercel custom environment.

The wizard links the repository, previews and applies Supabase product
migrations, applies Payload CMS migrations to the same database, configures
environment-scoped Vercel variables, and offers optional Google OAuth, email,
Turnstile, and GTM setup. It shows a redacted summary and asks again before
migrations, hosted Auth changes, replacing existing secrets, billable branch
creation, or production deployment.

Supabase currently requires one dashboard step for Payload media storage. When
the wizard pauses, open **Storage → S3**, enable the S3 protocol, generate an
access-key pair, and paste both values into the hidden prompts. When enabling
Google sign-in, register the callback URL printed by the wizard in Google Cloud
before continuing. Secret values are piped directly to their destination and
are not written to the repository.

Other Vercel Preview deployments are intentionally not given production or
long-lived development credentials. Per-pull-request Supabase branches are a
future enhancement. Inspect the complete plan without making remote changes
using:

```sh
pnpm setup:hosted -- --dry-run
```

The command is safe to rerun and can upgrade a Landing deployment by selecting
a broader profile. It preserves existing sensitive Vercel variables unless you
explicitly approve their replacement. Vercel environment changes only affect
new deployments, so accept the final production deployment prompt or trigger a
new deployment afterward. For staged setup, push the selected development
branch to create its Preview deployments.

Promotion is intentionally a reviewed Git workflow: merge the development
branch into the selected production branch, apply pending Supabase migrations,
apply Payload migrations with the production `DATABASE_URL`, deploy changed
functions, and deploy the Vercel projects. This promotes code, schema,
configuration, and functions. It does not copy development users, Payload
content or drafts, storage objects, or media into production.

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
- Create the Website Vercel project and, when the app is included, the App
  project; set their root directories and environment variables, then assign
  your domains.
- Replace or remove the example profile flow, migration, contract, core rule,
  repository, and Expo screen usage.
- Add your Resend domain and function secrets if you use the email examples.

See [docs/architecture.md](docs/architecture.md) and
[docs/database-ownership.md](docs/database-ownership.md) before adding a data
domain.

The profile flow is the included example domain. Forks can replace it by
removing its contract and rule from `contracts` and `core`, its repository from
`data`, the profile migration, and the profile query on the Expo home screen.

## Planned enhancements

- Isolated Supabase branches matched to individual pull-request previews.
- Selective Payload content and media promotion between hosted environments.
- A generic, source-configurable WordPress content importer. This will not
  restore the removed site-specific homepage importer.
