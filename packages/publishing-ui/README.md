# Publishing UI

Shared Next.js publishing components and Payload admin controls.

Public components consume publishing contracts and never fetch application data.
Applications load content and pass it to `PostList` and `LatestPostsSection`.
`SiteBrand` receives explicit identity values. `SiteHeader` receives rendered
navigation/search content, sticky state, and the application theme storage key.
Google Tag Manager and Turnstile components accept public integration identifiers;
verification and delivery protocols live in publishing-core; hosts supply credentials
and integration adapters. `ThemeToggle` requires the
application's storage key. `SiteConfigProvider` and `useSiteConfig` share the same
client context; import both from the `SiteConfigProvider` subpath.

Import public components through their named subpaths. `admin` is a separate
client entry point for `ColorPickerField`, `LinkRowLabel`, and
`createIconPickerField`. Create the icon field once in an application's client
adapter, supplying its icon definitions. Keep that adapter as the Payload import
map target. CSS for the admin controls ships in the package and loads with them.

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
