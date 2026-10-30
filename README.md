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
- `packages/data` — typed Neon repositories and generated database types.
- `packages/brand` — private starter identity and image assets.
- `packages/design-tokens` — framework-neutral visual tokens and fonts.
- `packages/publishing-core` — reusable publishing behavior for Payload-backed sites.
- `packages/publishing-ui` — shared public views, CSS, font loading, icons and Payload admin controls.
- `packages/config` — shared TypeScript settings and boundary enforcement.
- `database` — portable product/identity migrations and actor/realm policies.

Reusable Payload link fields and page blocks are owned by `publishing-core` through
`createPublishingFields` and `createPublishingBlocks`. Shared icon options come from the publishing packages; the site supplies Payload
admin component references, access policies and migration history. Import these factories from the `payloadFields` and
`payloadBlocks` package subpaths.

## Requirements and local development

Use Node.js 22+, pnpm 11, and Docker for local services. From a fresh checkout run:

```sh
pnpm run setup
```

Local setup asks only three questions: **local or hosted**, **project name**, and **administrator email**. Hosted setup uses your signed-in account email and asks which hosting organization to use only when you belong to several. Both paths have at most three interactive choices. Local setup installs the locked dependencies, generates independent signing secrets and storage credentials, selects available ports, starts isolated PostgreSQL/S3 containers, applies both migration sets, verifies private storage, and creates a verified CMS administrator and an editable homepage. An independent customer account is also provisioned for the Expo app, with its own password in the same private login file; it inherits no CMS permissions. Run `pnpm dev` to start the website/CMS and Expo web together. Read your generated administrator password from `.starter/administrator.json`; it is private and never printed. No email or social provider is required for the initial accounts; public editorial signup remains disabled.

Hosted setup requires signed-in `neon` and `vercel` CLIs (`neon login`, `vercel login`). It creates a **new, independent** Neon project and Vercel website, provisions private buckets and storage-only credentials, uses a restricted pooled runtime login, migrates through a separate privileged connection, bootstraps the administrator, installs runtime configuration, and deploys the website. The Vercel URL is detected automatically. Expo receives only that public backend URL. Native Expo clients can use it directly; local Expo web uses local setup, and hosted Expo web needs its own deployment and a trusted origin on the same site for browser sessions. Publishing a native app or deploying Expo web is separate from website setup. Optional email, social login, SMS, newsletter and anti-bot integrations are configured afterward.

For noninteractive use: `pnpm run setup --mode local --name my-product --email you@example.com`. Hosted supports `--site-url https://your-domain` (DNS verification required), `--region aws-us-east-2`, `--neon-org <id>` for noninteractive accounts with multiple organizations, and `--environment production`; production needs a **separate checkout and project name**, not shared development resources. `--configure-only` stops before migrations/bootstrap/deployment. `pnpm setup:production` retains the advanced legacy configurator for existing installations. Cloud projects consume your account's resources; account authentication is a prerequisite, not a secret to paste into setup.

Generated configuration lives in ignored, mode-600 files: root `.env` for local containers, `apps/site/.env.local` for website runtime, `apps/app/.env.local` containing only `EXPO_PUBLIC_SITE_URL`, and `.starter/release.env` for the privileged migration connection. `.starter/state.json` is a private recovery journal: reruns preserve keys/passwords and resume initialization. A failed provider operation with an unknown outcome stops for reconciliation rather than creating duplicate infrastructure. Existing unmanaged environment files are never replaced. Back up the private state; deleting it is not a reset command. No GroovePost tenant, domain-management, peer-transfer, worker or Dagster settings are required.

Change the generated account passwords after initial login. Without an email provider, password recovery requires operator intervention; adding verified email enables normal recovery. Run `pnpm generate` after Payload configuration changes and `pnpm check` before delivery. Integration tests require separate disposable local databases; never point tests at hosted data.

## Common commands

| Command                              | Purpose                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `pnpm dev`                           | Start the Payload/Next site and Expo development server together.      |
| `pnpm dev:site`                      | Start only the Payload/Next site.                                      |
| `pnpm dev:app`                       | Start only the Expo development server.                                |
| `pnpm dev:app:web`                   | Start the Expo app in a web browser.                                   |
| `pnpm payload:migrate`               | Apply pending Payload database migrations.                             |
| `pnpm payload:migrate:status`        | Show applied and pending Payload migrations.                           |
| `pnpm payload:migrate:create <name>` | Generate a Payload migration after changing its schema.                |
| `pnpm generate:payload`              | Regenerate Payload types and the admin import map.                     |
| `pnpm run setup`                     | Set up local or hosted website, CMS and Expo backend in three choices. |
| `pnpm setup:hosted`                  | Run the hosted path of the three-choice setup.                         |
| `pnpm setup:production`              | Run the backward-compatible single-app production setup.               |
| `pnpm check`                         | Run all checks and builds; requires the local Neon stack.              |
| `pnpm changeset`                     | Record a releasable shared-package change.                             |

### Versioned application API

The public site and universal app use the Hono BFF mounted at `/api/v1` for
content, forms, runtime configuration, and product data. Its OpenAPI document
is available at `/api/v1/openapi.json` and interactive Swagger documentation
at `/api/v1/docs`. Public reads return published content. Product routes such
as `/api/v1/me/profile` require the Neon access token as a Bearer token and
continue to rely on PostgreSQL actor/realm policies.

Better Auth remains a direct protocol integration for OAuth, refresh, and
sign-out. Payload Admin similarly retains its authenticated native API because
that is the admin application's transport. Application presentation code does
not query Payload or Neon product tables directly: Next.js invokes the
same Hono handlers in process, while Expo uses `@starter/api-client` over HTTP.
The older site-config, contact, newsletter, and preview URLs remain as
compatibility shims for deployed clients.

The public homepage is a Payload Page with the slug `home`. Setup creates a minimal published homepage only when none exists. Open `/admin` to edit its sections using the available blocks. Additional Pages render
at `/<slug>`. Add a **Latest posts** block wherever you want published Posts
to appear. The Page editor groups title and slug under **General**, sections
and custom CSS under **Layout**, and search/social metadata under **SEO**.
Pages and Posts support drafts; use Payload's Preview action to preview
unpublished content. Configure editor-managed header and footer links
in **Header navigation** and **Footer navigation** Globals. **Site settings**
holds the site/app titles, short name, light/dark logos, favicon, fallback SEO
description, social preview metadata, runtime theme, Google Tag Manager ID, and
Turnstile site key. Shared color controls register their configured Payload validators so palette validation participates in the form lifecycle. Header navigation owns
only the header links. Header links use the shared searchable icon picker, which
combines recognizable social-media brand marks with a curated set of general
interface icons; icon-only links retain their configured label for assistive
technology. The built-in Search link can be hidden or replaced with any icon
from the same picker. Footer navigation
provides an ordered board of content areas and columns for brand copy, social
profiles, links, posts, copyright, newsletter, and contact components.
Header and footer navigation, styled actions, link grids, portfolio cards, and linked
logos use the same destination controls: select a published Page or Post, or enter a
safe relative, HTTPS, email, or telephone URL. Link and action editors share the
curated icon picker; styled actions also support left/right icon placement, while
navigation links may display an accessible icon without visible label text.
Newsletter and contact components can appear in any column, in the editor’s
configured order. Each latest-posts component selects its own post limit.

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

The website is public. App sign-in uses Better Auth, while Payload Admin has
separate CMS user accounts. Creating a Payload user at `/admin` does not create
an app account, and app accounts do not grant CMS access.

Configure customer and editorial Google/Facebook, verified email and SMS providers through the server environment described in [authentication](docs/authentication.md). Provider secrets never reach Expo clients. Register callbacks at the explicitly configured site origin.

## Environment variables and secrets

Runtime `DATABASE_URL` is a pooled restricted Neon login; `DATABASE_MIGRATION_URL` is a privileged direct connection used only by migration/release jobs. Keep `PAYLOAD_SECRET`, `AUTH_SECRET`, provider credentials, and standard `AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY` server-only. `AWS_ENDPOINT_URL_S3/AWS_REGION` select the matching environment’s private storage. `SITE_URL` and `AUTH_TRUSTED_ORIGINS` are explicit configuration. Expo receives only `EXPO_PUBLIC_SITE_URL`.

Optional contact/newsletter services use `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `CONTACT_TO_ADDRESS`, `MAILERLITE_API_KEY`, and `TURNSTILE_SECRET_KEY`. Preserve existing configured values; never commit them. Customer/editorial identity provider configuration is documented in [authentication](docs/authentication.md).

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
tables in a Neon migration, and do not hand-author SQL from a mockup before
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

Create separate Neon development and production projects. Use pooled `DATABASE_URL` with a restricted runtime login, direct privileged `DATABASE_MIGRATION_URL` for migrations, and standard `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` values. All three buckets declared in `neon.ts` remain private. The starter owns its own customer/editorial Better Auth realms and independently administered Payload content.

For existing installations, configure one environment with `pnpm setup:production --environment development --vercel-project-id <id> --vercel-org-id <scope> --env-file <private-env> --site-url <https-origin> --auth-trusted-origins <origins>`. Use `production` for the corresponding production project. `--dry-run` prints redacted configuration; existing values are preserved unless `--replace-existing` is explicit. Setup does not migrate or deploy.

For controlled releases, use one Vercel project: Production tracks `main`, custom `dev` tracks `develop`, and feature branches use Preview with development resources. Both GitHub release environments reference that project while retaining separate database, signing and storage credentials. Configure matching GitHub environments with deployment and direct migration credentials plus the AWS secrets/variables described in [the release runbook](docs/release-runbook.md). Promote feature MR -> develop -> main, requiring CI and hosted development acceptance before production. Production receives code and pending schema migrations; its records, users, files and secrets remain independent of development.

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
- Create separate Neon dev/prod projects, apply owned migrations through releases, and set
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

- Isolated Neon branches matched to individual pull-request previews.
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
per-page inheritance; footer content areas support 1–4 equal-width columns.
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

## Native authentication

Better Auth is the sole provider for customer and editorial identity. The starter owns its backend and explicitly linked CMS roles; GroovePost-hosted apps use the platform SDK session bridge. Follow [authentication](docs/authentication.md) for explicit provider configuration, editorial reconciliation and real delivery acceptance. CMS logout revokes the editorial native session.

## Release workflow

See [the release runbook](docs/release-runbook.md) for branch ownership, required
checks, coordinated deployment/publication, handover settings and recovery.
Controlled automation stays disabled until its environment prerequisites are
configured and the dev handover is verified. Builds run on Vercel with live domains
unchanged until explicit activation, keeping sensitive runtime settings out of CI.
Approved publishing-ui fixes can use the manual package-only mode on develop;
that mode validates and publishes the package without deploying a site.

Publishing section widths inherit from site → page → block. Site defaults to
Padded; pages default to Site and blocks to Page. Full and Padded overrides align
with the shared header/footer container, while paragraph reading width stays
independent. The final block meets the footer without extra shell padding or an
outside footer margin; blocks and the footer retain their own interior spacing.
See [the layout guide](docs/practical-layouts.md#section-width-inheritance).

Header navigation offers independent **Header top** and **Header scrolled**
backgrounds (Fill by default, or Transparent). Transparent top headers overlay
leading background heroes; artwork covers the full section while copy retains
configured gutters. Sticky headers stay visible; the scrolled state starts
after 8px.

Hero headings are required when saving content. Already-published heroes with a
blank heading render their remaining content without crashing the public page.

Hero sections offer **Fill screen** height and **Top**, **Middle**, or **Bottom**
vertical content alignment, independently of horizontal alignment. Fill screen
accounts for the responsive site header and authored section spacing; long content
can grow beyond the screen. Existing heroes retain their height and middle alignment.

Shared publishing storage uses standard S3 configuration: `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, and `AWS_REGION`.
`CMS_MEDIA_BUCKET` selects the media bucket (default `cms-media`).
S3 credentials stay server-side; the endpoint supports any path-style S3 provider.

Database pools default to two connections with 10,000 ms idle and connection timeouts. Optional pool environment settings override these bounds.

Database URLs must use PostgreSQL schemes. The deprecated `DATABASE_POOLER_PORT` is accepted during migration when the URL omits its port or specifies the same port; conflicting explicit ports fail without reporting connection credentials. Encode the final pooler port in `DATABASE_URL`.

Shared palette fields carry portable validation metadata. The color picker applies the shared contrast rule on the client as well as the server, so generic text validation cannot clear a rejected palette’s field errors.

### Identifier display

Use names, titles or emails as primary labels. Secondary identifiers display as the first eight and last four characters (`26f5d41a…25d6`); short references remain unchanged. `publishing-ui/Identifier` retains the full value in its tooltip and accessible label, and `publishing-ui/admin/IdentifierDisplay.css` compacts Payload's built-in ID labels. Database values, links, SDK calls, queries and editable fields always keep full IDs. This convention applies to consumers such as GroovePost, Diggers Union and WBUR.

Shared web loading presentation is available from `@danielmarkland/publishing-ui/LoadingRegion` with `LoadingRegion.css`. Load that CSS with the host's initial page styles so announcements stay visually hidden before app assets arrive. `LoadingRegion` announces loading without replacing its children and gently reveals ready content over 160ms, respecting reduced-motion preferences; compose decorative `Skeleton` geometry for the screen being loaded. Hosts own asset loading and apps own data loading.

Newsletter CTA and footer forms share the same destination selector and signup
component. This starter remains independent of GroovePost: configure
`MAILERLITE_API_KEY`, `TURNSTILE_SECRET_KEY`, the public Turnstile site key in CMS,
and `NEWSLETTER_DESTINATIONS` as a JSON array, for example
`[{"id":"readers","name":"Readers","groupId":"123","isDefault":true}]`.
The footer or any CTA can select a named destination; blank uses the explicit
default. Missing or unavailable destinations disable signup and fail closed on
submission. Choose the CTA's Newsletter type to render the shared form.
The provider adapter verifies the `newsletter` Turnstile action and does not force
existing MailerLite subscribers back to active. The starter owns these settings;
no platform service credentials or database are required.

Before upgrading an existing newsletter site, record its current footer group ID
and configure the corresponding destination in `NEWSLETTER_DESTINATIONS`. Apply
Payload migration `20261018_210000_newsletter_cta`; the old group column is retained
as configuration history but is no longer a runtime delivery path. Verify an
operator-controlled signup in the intended MailerLite group after deployment.

Site branding supports editable logo bounds (240×56px by default). Website action buttons share a 192px width and 50px minimum height, including accented header links. The three shared publishing packages can be published from develop without deploying a site; see the release runbook.

The shared footer builder replaces fixed CTA/newsletter/footer presets with any number of content areas. Each area has 1–4 equal-width columns and reusable logo, formatted text, navigation, social, CTA, latest-post, copyright, newsletter, and contact components. Editors can move components between columns, edit native Payload fields in a settings panel, and preview mobile stacking. Site imports/exports preserve nested content and references. Area and component appearance settings control their own spacing, surfaces, and borders.

## Changelog

Record noteworthy implemented changes in [CHANGELOG.md](CHANGELOG.md). Follow
the [release runbook](docs/release-runbook.md) for release preparation and approval.

Reusable native Payload admin presentation is exported from `publishing-core/adminPresentation`; hosts register its plugin after schema-producing plugins and import `publishing-ui/admin/AdminPresentation.css`. Hosting services and authorization remain host-owned.
