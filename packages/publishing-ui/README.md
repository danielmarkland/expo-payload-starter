# Publishing UI

Shared Next.js publishing components and Payload admin controls.

`AdminPresentation.css` sets consistent native admin gutters, document/header spacing, action groups and compact upload dropzones, with 44px upload button targets on phones and touchscreens. It applies to native create/edit screens and shared workflows; minimal login layouts retain their separate presentation.

Native upload editors with an Alt field place the file control and metadata in equal desktop columns, stacking below 600px of available editor width. File selection, URL upload, previews, replacement and validation remain native.

The same minimal dropzone height, padding and secondary actions apply to native upload relationship fields throughout the admin, including Authors, branding, nested blocks and drawers. Existing selected-file cards and unstyled dropzones keep their native presentation.

Native SEO rows use aligned headers/inputs and compact guidance. Auto-generate buttons are hidden from the SEO controls by request; manual editing, validation and native generation endpoints remain intact. Individual missing/count/progress strips are hidden by request; native validation errors and the overview/preview remain available. `admin/SEOMetaImageLabel` retains the native localized label/required marker and adds sharing-image guidance. SEO styles are scoped to rows composed by the shared plugin.

Editorial field pairs use native Payload rows from `publishingAdminPresentation` and adapt to the editor's available width. Native image/file actions share the small secondary action appearance, including disabled states; their original drawers, permissions and upload behavior remain native.

Use `admin/AdminFieldGrid` for related short controls in manually composed workflow forms, including service credentials and creation drawers. Place editors, uploads, tables, notices and action groups outside it. It shares the native rows' 600px available-width breakpoint. Do not duplicate form grids in individual hosts or force every field type into columns.

Native collection lists keep creation in the header and hide duplicate empty-state create actions when that header action is available.

Forms separates submission status from the form list and keeps creation/settings actions in the header. Hosts may supply `documentationURL` to show API documentation under Advanced.

The footer editor starts with a full-width empty state, then exposes its layout board and native field inspector once content areas exist. Builder styles are scoped to its own controls.

Public components consume publishing contracts and never fetch application data.
Applications load content and pass it to `PostList` and `LatestPostsSection`.
`SiteBrand` receives explicit identity values. `SiteHeader` receives rendered
navigation/search content, sticky state, and the application theme storage key.
Header top and scrolled backgrounds independently select Fill (default) or
Transparent. The scrolled state starts above 8px; transparent surfaces have no
blur. A transparent top header overlays a leading background hero, with measured
header height reserving room for its copy. Background hero artwork covers the
entire outer section, including configured gutters and padding.
Google Tag Manager and Turnstile components accept public integration identifiers;
verification and delivery protocols live in publishing-core; hosts supply credentials
and integration adapters. `ThemeToggle` requires the
application's storage key. `SiteConfigProvider` and `useSiteConfig` share the same
client context; import both from the `SiteConfigProvider` subpath.

Import public components through their named subpaths. `admin` is a separate
client entry point for `ColorPickerField`, `LinkRowLabel`, and
`createIconPickerField`. Create the icon field once in an application's client
adapter, supplying its icon definitions. Keep that adapter as the Payload import
map target. ColorPickerField registers the supplied Payload validator so palette contrast errors participate in client form validation before saving. CSS for the admin controls ships in the package and loads with them.

React and Next.js are peers. Payload and its UI are optional peers needed only
when using the admin entry point. Existing public-site CSS classes are preserved;
the package owns their stylesheet (`base.css` and `layout.css`). Hosts import
these styles without local copies. No application brand defaults are included.

Build before packing or publishing. The release command builds dependencies in
order; prepack verifies compiled entry points, client directives, and styles
without rebuilding dependencies during concurrent publication.

`Article`, `EditorialArchive`, `SearchPage`, and `LandingPage` own public view
markup. `ConfiguredSiteHeader` resolves navigation presentation using shared icon
definitions. Host adapters fetch content and enforce access policy. `fonts` exports
`publishingFontClassName`; add this package to Next.js `transpilePackages` to let
Next process the bundled font loader. Fonts come from `design-tokens` assets.

The shared `publishing-core/presentationBoundary` tooling rejects public view
markup, CSS rules, font loaders, icon catalogs, and theme helpers in either host.
Reusable CMS controls are shared. Document shells and Payload admin route/import-map
wiring remain application-owned, alongside application-specific access policy.

Contact and newsletter forms use one internal submission hook for in-flight
locking, retry and challenge reset. Each form retains its own fields and markup.

## Funnel layouts

`./FunnelLayout` exports `FunnelLayout`, `StepProgress`, `ChoiceGroup` and
`UploadCard`; import `./FunnelLayout.css` with `./FunnelControls.css`. Reusable
markup/styles belong here. Consumers own flow logic and use tenant context for
branding, public footer text and contact links; no WBUR theme is embedded.
Native choices support keyboard/form validation. Upload cards handle choosing,
dropping and replacing a file; persistence and server validation remain adapters.

Run `pnpm --filter @danielmarkland/publishing-ui test:layout` with Playwright
Chromium installed to verify responsive section widths, hero coverage, and all
header surface/sticky combinations. CI runs these browser checks before site E2E.

Shared palette fields carry portable validation metadata. The color picker applies the shared contrast rule on the client as well as the server, so generic text validation cannot clear a rejected palette’s field errors.

`ProductWidget` is a reusable product card exported from
`@danielmarkland/publishing-ui/ProductWidget`. It shows optional artwork and price,
accepts editorial children, and delegates product navigation and cart actions to
the host. Set `busy` while a cart update is pending; unavailable products cannot be
added. Its themed styles ship in `FunnelControls.css`. Actions use non-submit
buttons, including when the card appears inside a form.

`CustomerCommerce` supplies provider-neutral customer connection and paginated order
views. The host passes authenticated state, sign-in behavior and authorized actions;
provider credentials and redirects remain host-owned. Import `CustomerCommerce.css`
and `FunnelControls.css`. Catalog presentation continues through `ProductWidget`.

Footer navigation selects a page or dark background independently of the page theme. Dark footers use the tenant's dark-section colors and dark logo. FunnelLayout accepts tenant logo URLs, website and contact destinations, and an internal help navigation callback. Its content expands to keep the footer at the viewport bottom. Contact form factories accept an explicit public site key and delivery callback for hosted consumers; website forms use SiteConfigProvider and the standard endpoint.

Newsletter forms accept injected `getDestinations` and `subscribe` operations, so
hosts can use their ordinary SDK. `createPageRenderer` requires a NewsletterForm
adapter and renders it for CTA blocks with `ctaType: newsletter`. Footer signup
uses the same component. The shared admin NewsletterDestinationField loads safe
choices from a host-supplied endpoint; missing destinations disable submission.

Block pages let the first and last blocks control their own section spacing.
The page shell adds no trailing padding, and an adjacent site footer adds no
outside margin, so full-width final sections meet the footer without an empty
band. Footer interior padding and spacing after other page types are preserved.

Site branding supports optional `logoMaxWidth` / `logoMaxHeight` pixel bounds, defaulting to 240×56px. Logo rendering preserves proportions and available width. Website action buttons use 192px width and 50px minimum height, including accented header navigation.

`SiteFooter` renders the ordered `contentAreas` contract. Each area supports 1–4 equal-width columns; at 900px and below columns stack in order. Blocks include logo, rich text, links, social links, CTA, latest posts, copyright, newsletter and contact forms. Empty areas and disabled blocks do not render blank sections. Forms retain independent state and share the existing host delivery adapters.

Contact and split-content page sections stack on phones. Contact submit actions follow the same 192px width and 50px minimum height as other website actions.

Footer area and component appearance controls apply their configured padding, margins, surfaces, and borders independently of page sections. Unconfigured components retain their compact default spacing.

Footer surface colors preserve the area’s configured full-width or padded gutters; padding overrides remain independent.

Blank footer area top/bottom padding uses the medium design-system default before and after persistence. Select None for an explicit zero-padding override.

`admin/ThemeTransfer` supplies native Theme export/upload controls. The host supplies
authorized asynchronous jobs, errors and a busy flag; `onImport` resolves `true`
only when upload/finalization succeeds, keeping the drawer open after failure. Theme
packages contain visual settings only. The host renders the resulting preview,
destination confirmation, progress and recovery actions.
