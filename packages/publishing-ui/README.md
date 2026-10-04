# Publishing UI

Shared Next.js publishing components and Payload admin controls.

Public components consume publishing contracts and never fetch application data.
Applications load content and pass it to `PostList` and `LatestPostsSection`.
`SiteBrand` receives explicit identity values. `SiteHeader` receives rendered
navigation/search content, sticky state, and the application theme storage key.
Google Tag Manager and Turnstile components accept public integration identifiers;
verification and delivery services remain in the application. `ThemeToggle` requires the
application's storage key. `SiteConfigProvider` and `useSiteConfig` share the same
client context; import both from the `SiteConfigProvider` subpath.

Import public components through their named subpaths. `admin` is a separate
client entry point for `ColorPickerField`, `LinkRowLabel`, and
`createIconPickerField`. Create the icon field once in an application's client
adapter, supplying its icon definitions. Keep that adapter as the Payload import
map target. CSS for the admin controls ships in the package and loads with them.

React and Next.js are peers. Payload and its UI are optional peers needed only
when using the admin entry point. Existing public-site CSS classes are preserved;
the consuming site owns their stylesheet. No application brand defaults are
included.

Build before packing or publishing. The release command builds dependencies in
order; prepack verifies compiled entry points, client directives, and styles
without rebuilding dependencies during concurrent publication.
