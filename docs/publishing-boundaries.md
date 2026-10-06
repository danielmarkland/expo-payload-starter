## Publishing presentation ownership

- `publishing-contracts` owns portable schemas; `design-tokens` owns design tokens and licensed font assets; `publishing-core` owns reusable theme resolution and content rules; `publishing-ui` owns public markup, CSS, font loading, icons, and navigation presentation.
- Website routes, public components and presentation helpers are adapters: fetch content, enforce access/tenant policy, resolve metadata and destinations, then invoke shared views. Do not add host DOM markup, CSS rules, icon registries, or theme resolvers. The frontend root layout may render document shell tags and inject the shared theme CSS. Reusable CMS controls and publishing workflows are shared too. Hosts retain Payload route/import-map wiring and application-specific administration, authentication, storage and access policy. The starter must administer its own content independently of GroovePost.
- Extend shared package exports before adding capabilities to either host. Keep deployment destinations in environment configuration or tenant records.
- Both repositories run the same `publishing-core/publishingBoundary` policy during lint. Add acceptance/rejection coverage when changing the boundary; do not bypass it with local renderer copies.

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

## Publishing HTTP contracts

`publishing-contracts/publishingApi` owns canonical publishing route descriptors,
request validation, selected-post query types and documented error responses.
Hosts register these descriptors in Hono and supply scoped service calls. Product,
tenant and domain endpoints remain host-owned.
`publishing-core/publishingHttp` owns preview header checks, error formatting and
cache policy without depending on Hono. Errors, authenticated requests and preview
requests are never publicly cached. API handlers import their service owners
directly; a catch-all API services barrel is unnecessary. Shared lint also checks
dynamic imports, require calls and re-exports and rejects copied publishing routes.
