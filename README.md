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

For noninteractive use: `pnpm run setup --mode local --name my-product --email you@example.com`. Hosted supports `--site-url https://your-domain` (DNS verification required), `--region aws-us-east-2`, `--neon-org <id>` for noninteractive accounts with multiple organizations, and `--environment production`; production needs a **separate checkout and project name**, not shared development resources. `--configure-only` stops before migrations/bootstrap/deployment. Cloud projects consume your account's resources; account authentication is a prerequisite, not a secret to paste into setup.

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
Contact, newsletter and site configuration use their `/api/v1` routes.
Payload document preview retains its native authenticated `/api/preview` entrypoint.

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

## Theme and content authoring

See [theme and content authoring](docs/theme-authoring.md) for theme defaults, page composition, design briefs, agent examples and safe content migrations.

## Hosted environments and deployment

Create separate Neon development and production projects. Use pooled `DATABASE_URL` with a restricted runtime login, direct privileged `DATABASE_MIGRATION_URL` for migrations, and standard `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` values. All three buckets declared in `neon.ts` remain private. The starter owns its own customer/editorial Better Auth realms and independently administered Payload content.

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

Database URLs must use PostgreSQL schemes and include their connection port directly in `DATABASE_URL`.

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

The shared publishing packages also expose visual-only Theme archive operations and native import/export controls; see [publishing-core](packages/publishing-core/README.md) and [publishing-ui](packages/publishing-ui/README.md). Full-site archives retain both theme and content.

## Build caches

Stop local development processes, then run `pnpm clean:cache` to remove regenerable Turbo, Next.js and Expo caches. Dependencies, database volumes, private setup state and credentials are retained. Shared-package builds remain cached; site builds run without Turbo artifact caching to avoid retaining a full Next.js build for every input change.
