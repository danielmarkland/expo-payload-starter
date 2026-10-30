# Publishing core

Owns reusable publishing rules, Payload field/block factories, portability and
framework-independent theme resolution. `siteConfig` accepts explicit identity,
settings and site URL; it resolves palettes and emits shared theme CSS. Hosts
supply brand defaults or tenant validation and deployment destinations.

Public markup, CSS, fonts and icon presentation belong to publishing-ui. Core
must not import host application code. `presentationBoundary` exports the one
Node tooling policy used by both hosts during lint; hosts supply their TypeScript
compiler. Tests for the policy live in packages/config/scripts.

## CMS and service ownership

The public starter fully administers its own publishing content with native Payload
Admin. Shared collection/global factories, field definitions, editor controls,
preview construction and validation belong to publishing-core/publishing-ui;
neither host may maintain parallel implementations. Hosts inject access rules,
tenant indexes, destinations, storage and authentication. The starter retains its
standalone CMS identity; GroovePost retains Supabase SSO and tenant isolation.
The starter's first native registration becomes an administrator. Anonymous and
editor account creation and editor role changes are denied.

Shared content response parsing, search normalization, metadata, sitemap rules,
contact/newsletter delivery protocols and server configuration live in core.
Hosts supply request transports, scoped database queries and configured credentials.
Publishing repositories and form services are separate from tenant/domain services
and privileged storage clients. HTTP handlers depend on services; business services
must not import HTTP API modules. The shared publishingBoundary lint policy enforces
this direction and rejects copied CMS schemas and publishing renderers. Native
Payload routes/import maps, migrations and generated types remain host registration
and schema history, rather than duplicated business implementations.

Public document previews require tenant identity and a stored ready primary domain.
Tenant management may display the configured primary domain before readiness.
Missing domains and unresolved live tenant context fail closed; configuration does
not supply a guessed tenant or runtime domain fallback.

`publishingHttp` provides framework-independent API response/error, preview and
cache policies. The host’s HTTP handler keeps logging and security context. Route
descriptors and request schemas are in publishing-contracts/publishingApi.

Build before packing or publishing. The release command builds dependencies in
order; prepack verifies every exported output instead of rebuilding during
concurrent publication. This prevents another package's clean step from removing
a dependency while core compiles. Run test:package to build and verify locally.

## Site transfer writes

Replacement isolates each document's upload buffers and cloud-storage context while
retaining the transaction and trusted host context. Relationship resolution updates
must not replay an earlier media upload. Disabled footer form groups accept null
and omitted values; the CMS applies its normal disabled defaults.

The engine verifies stored original sizes and SHA-256 hashes immediately after
upload and again after relationship resolution, before committing. Storage hooks
that change original bytes fail replacement rather than silently corrupting the
archive. Destination image transformations must preserve the imported original;
derivatives can be rebuilt independently.

Database URLs must use PostgreSQL schemes. The deprecated `DATABASE_POOLER_PORT` is accepted during migration when the URL omits its port or specifies the same port; conflicting explicit ports fail without reporting connection credentials. Encode the final pooler port in `DATABASE_URL`.

Newsletter delivery resolves a named destination through the host-injected
`getDestination` callback, verifies Turnstile, then calls its subscription adapter.
`createMailerLiteNewsletter` supplies the trusted server MailerLite adapter without
forcing subscriber status. `newsletterFields` exports the shared editor selector
configuration; blocks and navigation accept it as `newsletterDestinationField`.

Site branding supports optional `logoMaxWidth` / `logoMaxHeight` pixel bounds, defaulting to 240×56px. Logo rendering preserves proportions and available width. Website action buttons use 192px width and 50px minimum height, including accented header navigation.

`payloadNavigation` defines native footer content areas, columns, and blocks. `publishing-ui/admin/FooterEditor` renders the shared visual editor with native Payload field settings, cross-column drag, keyboard move controls, and mobile layout preview. `footerMigration` is a one-time conversion for the retired SQL/footer shape, not a public rendering fallback. `footerLayout` supplies movement and latest-post query helpers.

Theme transfer exports `exportTheme`, `previewThemeImport` and `importTheme` from
`siteTransfer`. Its restricted archive contains only Site Settings `theme` and
`buttons`, without content, navigation, branding, media or integrations. Import
updates the existing settings document after a fresh preview and verified full-site
backup, under the host write lock and transaction receipt. Full-site transfer keeps
its complete design/content behavior. Hosts supply authorization, scope and storage.
