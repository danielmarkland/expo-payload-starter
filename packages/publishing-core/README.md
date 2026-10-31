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

See [publishing boundaries](../../docs/publishing-boundaries.md) for the canonical ownership, authentication and service rules.

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

Database URLs must use PostgreSQL schemes and include their connection port directly in `DATABASE_URL`.

Newsletter delivery resolves a named destination through the host-injected
`getDestination` callback, verifies Turnstile, then calls its subscription adapter.
`createMailerLiteNewsletter` supplies the trusted server MailerLite adapter without
forcing subscriber status. `newsletterFields` exports the shared editor selector
configuration; blocks and navigation accept it as `newsletterDestinationField`.

Site branding supports optional `logoMaxWidth` / `logoMaxHeight` pixel bounds, defaulting to 240×56px. Logo rendering preserves proportions and available width. Website action buttons use 192px width and 50px minimum height, including accented header navigation.

`payloadNavigation` defines native footer content areas, columns, and blocks. `publishing-ui/admin/FooterEditor` renders the shared visual editor with native Payload field settings, cross-column drag, keyboard move controls, and mobile layout preview. `footerMigration` is a one-time conversion for the retired SQL/footer shape, not a public rendering fallback. `footerLayout` supplies movement and latest-post query helpers.

`publishingAdminPresentation` applies the default admin layout throughout collection/global fields, tabs, groups, arrays and blocks: adjacent short native controls share unnamed rows. Unpaired ordinary controls, textareas, uploads and multi-value relationships occupy their own half-width desktop rows. Conditional controls remain separate and retain their conditions. Existing rows, explicit widths, hidden/sidebar fields, custom controls and rich text/code/builders retain their placement. Checkboxes pair with checkboxes; related upload pairs are composed explicitly. Semantic pairs include Post author/publication date and categories/tags. Stored paths, validation, hooks and access remain intact. The shared stylesheet uses two columns with at least 600px of available editor width, stacking narrow editors; compact numeric settings retain their deliberate layout.

Custom Page CSS appears directly in the page editor's Appearance tab, without a collapsible wrapper. Its stored field and CSS validation remain unchanged.

Authors explicitly pair Image and Website in one responsive row. Uploads are not automatically full width when a deliberate, related field pair fits the editor.

Categories use a Title/Slug row, then separate half-width Parent and Description rows. All controls expand to full width in narrow editors.

Tags retain their Title/Slug row, followed by Description alone in the left half of a desktop row, expanding to full width in narrow editors.

The native SEO Preview precedes its editable controls. Site Settings renders Archive List Surface, Button Shape and Favicon each in its own half-width desktop row, expanding controls in narrow editors.

Native SEO metadata uses two responsive rows throughout collections and globals: Title/Meta Image, then Description alone at half width. Native generation endpoints, localization, overview/preview and additional plugin fields remain intact. Site Settings keeps its separate fallback site description under Site, at the same stored path.

SEO Title, Description and Meta Image are required using native Payload validation and draft rules. The shared presentation removes their individual missing/count/progress strips, uses manual editing and supplies image guidance through a native label component. Auto-generate buttons are hidden by request. Existing records are not backfilled; incomplete metadata must be completed when native save/publish validation applies.

Theme transfer exports `exportTheme`, `previewThemeImport` and `importTheme` from
`siteTransfer`. Its restricted archive contains only Site Settings `theme` and
`buttons`, without content, navigation, branding, media or integrations. Import
updates the existing settings document after a fresh preview and verified full-site
backup, under the host write lock and transaction receipt. Full-site transfer keeps
its complete design/content behavior. Hosts supply authorization, scope and storage.

Major editor areas use native tabs; related fields stay within those areas. Site Settings uses Site, Design and SEO, with branding/core appearance directly in Design and post listings/public integrations collapsed under Site. Header uses Menu Links and Utility Links tabs, followed by collapsed Header Appearance. Footer keeps title/background beside its builder, and small editors remain flat. These containers are unnamed and preserve stored paths, conditions and native saving.
