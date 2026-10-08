# expo-payload-starter

A production-oriented starter for a content-led product with one universal
authenticated application.

## Applications

- `apps/app` — Expo Router application for web, iOS, and Android.
- `apps/site` — Next.js public website, Payload CMS, preview, and admin UI.
- `packages/contracts` — example product-domain Zod contracts.
- `packages/publishing-contracts` — reusable publishing and site-presentation contracts.
- `packages/api-client` — framework-neutral client for the versioned application API.
- `packages/core` — pure example-domain rules with no framework dependencies.
- `packages/auth` — provider-neutral identity and authorization interfaces.
- `packages/data` — typed Supabase repositories and generated database types.
- `packages/brand` — private starter identity and image assets.
- `packages/design-tokens` — framework-neutral visual tokens and fonts.
- `packages/publishing-core` — reusable publishing behavior for Payload-backed sites.
- `packages/publishing-ui` — shared public views, CSS, font loading, icons and Payload admin controls.
- `packages/config` — shared TypeScript settings and boundary enforcement.
- `supabase` — product database migrations, RLS policies, and seeds.

Reusable Payload link fields and page blocks are owned by `publishing-core` through
`createPublishingFields` and `createPublishingBlocks`. Shared icon options come from the publishing packages; the site supplies Payload
admin component references, access policies and migration history. Import these factories from the `payloadFields` and
`payloadBlocks` package subpaths.

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
| `pnpm changeset`                     | Record a releasable shared-package change.                        |

### Versioned application API

The public site and universal app use the Hono BFF mounted at `/api/v1` for
content, forms, runtime configuration, and product data. Its OpenAPI document
is available at `/api/v1/openapi.json` and interactive Swagger documentation
at `/api/v1/docs`. Public reads return published content. Product routes such
as `/api/v1/me/profile` require the Supabase access token as a Bearer token and
continue to rely on Supabase RLS.

Supabase Auth remains a direct protocol integration for OAuth, refresh, and
sign-out. Payload Admin similarly retains its authenticated native API because
that is the admin application's transport. Application presentation code does
not query Payload or Supabase product tables directly: Next.js invokes the
same Hono handlers in process, while Expo uses `@starter/api-client` over HTTP.
The older site-config, contact, newsletter, and preview URLs remain as
compatibility shims for deployed clients.

The public homepage is a Payload Page with the slug `home`. After the first
Payload migration, open `/admin`, create a Page with that slug, compose its
sections using the available blocks, and publish it. Additional Pages render
at `/<slug>`. Add a **Latest posts** block wherever you want published Posts
to appear. The Page editor groups title and slug under **General**, sections
and custom CSS under **Layout**, and search/social metadata under **SEO**.
Pages and Posts support drafts; use Payload's Preview action to preview
unpublished content. Configure editor-managed header and footer links
in **Header navigation** and **Footer navigation** Globals. **Site settings**
holds the site/app titles, short name, light/dark logos, favicon, fallback SEO
description, social preview metadata, runtime theme, Google Tag Manager ID, and
Turnstile site key. Header navigation owns
only the header links. Header links use the shared searchable icon picker, which
combines recognizable social-media brand marks with a curated set of general
interface icons; icon-only links retain their configured label for assistive
technology. The built-in Search link can be hidden or replaced with any icon
from the same picker. Footer navigation
controls the footer tagline, social profiles, legal and utility links, latest-posts
section, copyright owner, and optional site-wide newsletter and contact sections.
Header and footer navigation, styled actions, link grids, portfolio cards, and linked
logos use the same destination controls: select a published Page or Post, or enter a
safe relative, HTTPS, email, or telephone URL. Link and action editors share the
curated icon picker; styled actions also support left/right icon placement, while
navigation links may display an accessible icon without visible label text.
When both conversion sections are enabled, the MailerLite newsletter signup appears
before the contact form on every public page. The footer automatically lists the two
newest published Posts when its latest-posts section is enabled.

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

Google Tag Manager is optional. Set one container ID such as `GTM-ABC123` in
**Site settings → Integrations**. The site container does not load in Payload
Admin, and the Expo container only runs in the browser—not in native iOS or
Android apps. Configure consent and SPA page-view behavior in Tag Manager.

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

Copy the relevant `.env.example` files shown in [Local development](#local-development).
Keep real values in ignored `.env` files locally and in the hosting provider's
secret store in production. Never commit secrets. The **Handling** column
identifies secrets explicitly. Variables beginning with `EXPO_PUBLIC_` are
embedded in client builds: only put public configuration there, never a
password, private key, or service-role credential. See
[Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables),
[Expo environment variables](https://docs.expo.dev/guides/environment-variables/),
and [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

### Website and Payload (`apps/site/.env`)

| Variable                               | Handling      | Purpose                                                                                                                                                  |
| -------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                         | **Secret**    | Required server-only Payload Postgres connection string. For hosted setup, use the Supabase Session pooler URI from the same project.                    |
| `PAYLOAD_SECRET`                       | **Secret**    | Required Payload signing/encryption secret. Draft-preview authorization is derived from this value, so no separate preview secret is needed.             |
| `RESEND_API_KEY`                       | **Secret**    | Optional Resend API key used by Payload and the contact endpoint.                                                                                        |
| `EMAIL_FROM_ADDRESS`                   | Config        | Sender address for Payload and contact email. The site title is used as the display name.                                                                |
| `CONTACT_TO_ADDRESS`                   | **Secret**    | Optional contact recipient. When omitted, `EMAIL_FROM_ADDRESS` is used.                                                                                  |
| `TURNSTILE_SECRET_KEY`                 | **Secret**    | Server-only Cloudflare Turnstile verification secret.                                                                                                    |
| `MAILERLITE_API_KEY`                   | **Secret**    | Optional server-only MailerLite API key used by the global newsletter signup. The target group ID is configured in Footer Navigation.                    |
| `SUPABASE_S3_ACCESS_KEY_ID`            | **Secret**    | Supabase Storage S3 access key for Payload media uploads.                                                                                                |
| `SUPABASE_S3_SECRET_ACCESS_KEY`        | **Secret**    | Secret half of the S3 credential pair.                                                                                                                   |
| `SUPABASE_S3_ENDPOINT`                 | Config        | Supabase Storage S3 endpoint.                                                                                                                            |
| `SUPABASE_S3_REGION`                   | Config        | S3 signing region; the local default is `local`.                                                                                                         |
| `SITE_URL`                             | Config        | Required canonical URL outside Vercel; Vercel uses its configured production URL. Set `SITE_URL=http://localhost:3000` explicitly for local development. |
| `EXPO_PUBLIC_SUPABASE_URL`             | Public config | Supabase project URL used by authenticated BFF product routes.                                                                                           |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public key    | Supabase publishable key used with the caller's Bearer token; never use a service-role key here.                                                         |

Payload always uses the migration-created `cms-media` bucket, so there is no
bucket-name variable. See [Supabase Storage S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication) for credentials and connection details.

Public runtime configuration belongs in **Site settings → Integrations**:

- **Google Tag Manager ID** is shared by the website and Expo web.
- **Turnstile site key** is exposed to the public contact form; its secret key
  remains server-only.

Configure the optional global conversion sections in **Footer navigation**.
Enable **Newsletter CTA** after adding `MAILERLITE_API_KEY`, a MailerLite group
ID, and Turnstile keys. Enable **Contact form** after configuring Resend and
Turnstile. Both sections default off so an unconfigured deployment never
exposes a disabled form.

If a secret is accidentally exposed, rotate it with its provider, update every
environment that uses it, then redeploy. Do not paste database URLs or other
credentials into issues, chat, or logs.

### Universal app (`apps/app/.env`)

| Variable                               | Handling      | Purpose                                                                                                                        |
| -------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`             | Public config | Public Supabase project URL; local default is `http://127.0.0.1:54321`.                                                        |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public key    | Supabase publishable key, designed for client use; protect data with RLS. Never substitute a Supabase secret/service-role key. |
| `EXPO_PUBLIC_SITE_URL`                 | Public config | Public website URL used by the app; local default is `http://localhost:3000`.                                                  |

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

### Vercel deployment

Set the Website + CMS variables in the Vercel Website project, and the Expo
variables in the separate Universal app project. Use Vercel's Production,
Preview, and Development scopes as appropriate. Configure public integration
values in Payload Site Settings. Add email and S3 credentials only when using
those features. Vercel applies environment changes to new deployments,
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
app fetches the validated public `/api/v1/site-config` contract at launch and when
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
| Button shape   | Square, soft, rounded, pill                 | Controls public action corners independently; square is the default.           |
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

Public actions use four boxed variants: **Primary Filled**, **Primary Outline**,
**Secondary Filled**, and **Secondary Outline**. Primary variants use the
primary palette pair; secondary variants use the accent color and its
contrast-validated inverse. The shared treatment uses substantial 56px controls,
strong contrasting borders, and a subtle hover lift. Page editors choose a
variant for each CMS action and form submit button. Styled actions and form submits
also support an optional curated icon with left/right placement. New and legacy
contact forms default to Primary Filled, as does search.

When a mode-specific logo is absent, the header displays the site title. Native
app icons, splash artwork, Expo slug/scheme, and iOS/Android identifiers are
build-time values and require a new app build; they are not runtime Site
settings.

### Packaged defaults

The visual fallback source of truth is `packages/design-tokens/src/tokens.json`,
which defines light/dark colors, Poppins weights, type sizes, line heights,
spacing, radii, and layout widths. Starter titles, description, theme preference
key, and image names live in `packages/brand/src/brand.json`; its image assets
live in `packages/brand/assets/`. Reusable fonts remain in
`packages/design-tokens/assets/fonts/`; platform-specific identifiers remain in
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
`pnpm --filter @danielmarkland/design-tokens generate:css`. `pnpm check` verifies that
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
| Hero           | Primary or secondary page introduction    | Eyebrow, rich headline with accent spans, secondary heading, body, two styled actions, image.  |
| Rich text      | Editorial copy                            | Optional heading and Lexical rich text.                                                        |
| Image          | Standalone editorial image                | Media upload and optional caption.                                                             |
| Feature grid   | Repeated benefits or capabilities         | Eyebrow, heading, intro, card or stacked layout, title/description items, and optional action. |
| Split content  | Copy paired with media                    | Anchor, eyebrow, heading, rich text, image, left/right image position, and optional action.    |
| Link grid      | Resource or destination list              | Anchor, heading content, linked items with optional icons, and an optional action.             |
| Portfolio grid | Projects, people, or case-study summaries | Anchor, heading content, linked name/role/description cards, and an optional action.           |
| Call to action | Focused conversion prompt                 | Heading, body, and one required styled action.                                                 |
| Testimonials   | Social proof                              | Optional heading and quote/name/role items.                                                    |
| Logo cloud     | Clients, partners, or tools               | Anchor, heading, intro, and linked logo uploads.                                               |
| Contact form   | Built-in contact workflow                 | Anchor, eyebrow, heading, body, submit label, and success message.                             |
| Statistics     | Compact quantitative proof                | Optional heading and value/label items.                                                        |
| FAQ            | Expandable questions                      | Optional heading and question/answer items.                                                    |
| Latest posts   | Dynamic published-post listing            | Optional heading and a limit from 1 through 12.                                                |

Every block includes an optional **Appearance** group:

- Per-side padding: none, small (16px base), medium (40px), large (72px), or
  extra large (120px).
- Per-side margin uses the same presets; blank preserves that side's
  design-system default.
- Content width: site default, narrow text, viewport-wide, or full viewport.
- Background: default, raised surface, primary accent, or fixed dark treatment.
- Per-side borders: none, default, or accent, with a shared thin (1px), medium
  (2px), or thick (4px) width.
- Rounded container: on or off, using the active shape preset.

Appearance values are presets rather than arbitrary CSS measurements and remain
responsive automatically. The spacing values follow the Site settings density
preset: compact scales them by 0.8, comfortable uses their base values, and
spacious scales them by 1.2. Border widths remain fixed at 1px, 2px, and 4px.
Blank controls preserve each block's design-system default. The fixed dark
background intentionally stays dark in either mode; use it only when the design
calls for a mode-independent dark section.
Explicit left or right spacing overrides background padding and content-width
margins on that side, including when the selected value is none.

Other CMS-owned design surfaces are **Header navigation**, **Footer navigation**,
Media, Pages, Posts, Authors, Categories, Tags, Redirects, and SEO metadata.
Header and footer links share the searchable brand and general-purpose icon picker
and support optional icon-only display; the header may also be sticky. Post SEO images also
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

- Replace the site/app names, short name, description, and asset references in
  `packages/brand/src/brand.json`; replace the images in
  `packages/brand/assets/`. Replace reusable fonts in
  `packages/design-tokens/assets/fonts/` if needed.
- Customize colors, typography, spacing, radii, and layout tokens in
  `packages/design-tokens/src/tokens.json`, then regenerate the site CSS with
  `pnpm --filter @danielmarkland/design-tokens generate:css`.
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

### Shared content API contracts

Public content consumers parse responses with `publishing-contracts` and use its
schema-inferred `ApiPage`, `ApiPageBlock`, `ApiPost`, navigation, link, author,
taxonomy, and redirect types. Payload-generated types remain within CMS adapters.
Contracts validate all 14 page blocks and Lexical trees, preserve additive fields,
and accept string or numeric relationship IDs as well as populated documents.
Draft preview requests use the same contracts and retain the preview secret boundary.

Reusable editorial and navigation Payload fields are provided by
`@danielmarkland/publishing-core/payloadEditorial` and `/payloadNavigation`.
Field factories create independent definitions; the consuming application owns
slug uniqueness, collection/global access, and preview route registration. Shared
preview helpers own URL construction and request validation. `pnpm lint`
checks package imports and dependency declarations, including relative escapes.

Publishing UI owns page blocks, links, forms, footer presentation and shared icon
lookup. Applications supply scoped content loading, integration configuration and
route registration; reusable delivery protocols live in publishing-core. Pure URL and
post-heading helpers live in `publishing-core/navigation` and `/postHeadings`.
Payload schema definitions use explicit `/payloadPages`, `/payloadSiteSettings`,
`/payloadEditorial`, `/payloadNavigation`, and `/payloadSEO` entry points.

### Full-site export and replacement

The standalone server CLI can export a portable site archive, preview a complete
replacement, and apply it with a verified destination backup. See
[full-site export and replacement](docs/site-transfer.md) for coverage, migrations,
configuration, recovery, and disposable-database tests.

## Git and release workflow

Create feature branches from `develop` and open pull requests into `develop`.
Squash-merge feature pull requests. Release through a `develop` → `main` pull
request using a merge commit, then deploy and verify from `main`. Never commit
or push changes directly to `main`. Feature branches use a type prefix such as `feat/`, `fix/`, or `docs/`, including
agent-created branches, as required by `.instructions/shared.md`.

Public-repository commits must occur outside Monday–Friday, 8:00 a.m.–4:00 p.m.
America/Chicago, with current time checked immediately before each commit and
actual timestamps. Editing, testing, and staging may happen during that window.
Delivery actions require the applicable user authorization.

### Portable design capabilities

`publishing-core/designCapabilities` exports `describeDesignFields`,
`describeDesignResources`, `designTransferResources`, and `validateDesignRecords`.
Hosts generate a portable, hook-free field manifest from their final Payload
resource definitions and add renderer-specific guidance. Offline authoring tools
can validate required content, choices, rich text and links with record/field
locations, then use the existing archive encoder and `validateSiteArchive` without
initializing a database. The archive format remains version 1. Hero accent text
state now survives portable projection. Host-specific behavior, extensions and
visual acceptance remain the host's responsibility.

## Practical site layouts

See [practical site layouts](docs/practical-layouts.md) for hero variants, curated artwork grids, archive pagination, booking forms, screenshot mappings, and package rollout.

### Native landing-page design controls

Publishing settings now support independent curated heading/body/label fonts
(system, Poppins, Inter, IBM Plex Mono), heading weights, typography presets,
and configurable dark section colors. Fonts are bundled and served locally.
Optional section settings control inner width, heading spacing and card padding.
Feature grids support explicit desktop/mobile columns, joined cards, metadata,
rich-text bodies and numbered process steps. FAQs can use disclosure or visible
rows; CTAs can use a bordered container or full-width band with a contrasting
light button. Headers support social links, accent links and minimal mode, with
per-page inheritance; footer presets support brand/details or stacked layouts.
Existing content retains its previous defaults. Apply the new Payload migration
before using these fields. The migration removes the full-body B-tree search
index: long pages exceed its key-size limit, and it cannot accelerate the
existing substring queries. Search behavior and content are retained.

Native section containers share horizontal gutters regardless of surface color.
Full-width first/last native sections own their page-edge spacing. Adjacent native
sections with no top borders on the same surface share the larger vertical padding
preset; explicit margins keep authored separation. Terminal rich-text margins do
not add hidden section spacing. Omitted native width settings retain legacy layout.

## Publishing ownership

Public presentation lives in the publishing packages. Site routes and components
are data/metadata adapters, with document shells and Payload registration as explicit host
responsibilities. Both repositories enforce the shared presentation boundary
during lint. See [publishing boundaries](docs/publishing-boundaries.md).

Publishing ownership now includes native CMS factories, preview flows, content clients,
search/metadata rules and form delivery. HTTP routes are adapters over separate
business services. See [publishing boundaries](docs/publishing-boundaries.md).

Canonical publishing endpoint definitions and query validation live in
`publishing-contracts/publishingApi`; framework-independent cache/error/preview
policy lives in `publishing-core/publishingHttp`. Both hosts support selected post
IDs in authored order, filtered by publication and host access policy. Contact and
newsletter forms share submission, retry and captcha state in publishing-ui.

Hosted app consumers can import `publishing-ui/FunnelControls`, `FunnelControls.css`, and `PortableFonts.css`. These portable themed controls do not include authentication or tenant policy. `publishing-core/formDelivery` exports server-side `verifyTurnstile`.

## Authentication migration

`@danielmarkland/auth-runtime` supplies the shared Better Auth backend and React/Expo integration. It isolates platform/editor and customer identities in PostgreSQL realms and supports Google, Facebook, SMS and revocable developer OAuth. Existing starter login remains on Supabase Auth until users, application access and CMS roles are reconciled and the deployment is explicitly switched. See [the runtime contract](packages/auth-runtime/README.md); installing the package alone does not migrate an application.

## Better Auth migration

The starter includes an independent Better Auth backend, customer browser/Expo
client, and a separate editorial identity bridge. PostgreSQL and private file
storage remain supported. Follow [authentication setup](docs/authentication.md)
for provider callbacks, migrations, staff reconciliation and the coordinated
backend/app switch; current deployments stay on their existing login until those
checks pass. Groovepost-hosted custom apps use its SDK authentication bridge.

CMS logout also revokes the Better Auth editorial session after native activation.

## Release workflow

See [the release runbook](docs/release-runbook.md) for branch ownership, required
checks, coordinated deployment/publication, handover settings and recovery.
Controlled automation stays disabled until its environment prerequisites are
configured and the dev handover is verified.
