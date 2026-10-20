# @danielmarkland/publishing-ui

## 0.10.1

### Patch Changes

- Let block pages meet the footer without redundant page-bottom padding and footer margins. Preserve each section's configured padding and the footer's interior spacing.

## 0.10.0

### Minor Changes

- 0cb96ec: Add provider-neutral newsletter destinations, reusable CTA signup, editor destination selection, and an injected newsletter transport. Separate MailerLite delivery from verification and preserve subscriber status.

### Patch Changes

- Updated dependencies [0cb96ec]
  - @danielmarkland/publishing-contracts@0.11.0
  - @danielmarkland/publishing-core@0.14.0

## 0.9.0

### Minor Changes

- ec76ea2: Add tenant footer background selection, branded app navigation, and shared contact forms with a hosted delivery transport. Keep short app screens full height with the footer at the bottom.

### Patch Changes

- Updated dependencies [ec76ea2]
  - @danielmarkland/publishing-contracts@0.10.0
  - @danielmarkland/publishing-core@0.13.0

## 0.8.1

### Patch Changes

- Give shared loading regions a brief ready-content reveal that respects reduced-motion preferences.

## 0.8.0

### Minor Changes

- Add accessible loading regions and static skeletons, and keep short funnel footers at the viewport bottom.

## 0.7.8

### Patch Changes

- Add provider-neutral customer account connection, reconnect and paginated order views.

## 0.7.7

### Patch Changes

- Add a themed product card with host-owned navigation/cart actions and pending states.

## 0.7.6

### Patch Changes

- a6c223d: Prefer readable CMS titles and default columns, and provide shared compact identifier presentation that preserves full values for navigation and API calls.
- Updated dependencies [a6c223d]
  - @danielmarkland/publishing-core@0.12.4

## 0.7.5

### Patch Changes

- Preserve palette contrast validation on the client through shared field metadata.

- Updated dependencies
  - @danielmarkland/publishing-core@0.12.3

## 0.7.4

### Patch Changes

- Register the supplied Payload validator for color fields so invalid palette contrast blocks saving consistently.

## 0.7.3

### Patch Changes

- Updated dependencies [835f083]
  - @danielmarkland/publishing-core@0.12.2

## 0.7.2

### Patch Changes

- Render published heroes with null headings safely and reject missing hero headings in CMS validation.
- Updated dependencies
  - @danielmarkland/publishing-contracts@0.9.1
  - @danielmarkland/publishing-core@0.12.1

## 0.7.1

### Patch Changes

- Updated dependencies
  - @danielmarkland/publishing-core@0.12.0

## 0.7.0

### Minor Changes

- 1c9ce6c: Add Fill screen hero height and independent top, middle, and bottom copy alignment, accounting for responsive headers and section spacing.

### Patch Changes

- Updated dependencies [1c9ce6c]
  - @danielmarkland/publishing-contracts@0.9.0
  - @danielmarkland/publishing-core@0.11.0

## 0.6.0

### Minor Changes

- 3a007d7: Cover background hero sections including gutters and padding, and support independent filled or transparent top and scrolled header surfaces with measured leading-hero overlap.

### Patch Changes

- Updated dependencies [3a007d7]
  - @danielmarkland/publishing-contracts@0.8.0
  - @danielmarkland/publishing-core@0.10.0

## 0.5.0

### Minor Changes

- c0a1014: Add site, page, and block width inheritance with shared responsive containers,
  CMS choices, portable transfer fields, and independent paragraph reading measure.

### Patch Changes

- Updated dependencies [c0a1014]
  - @danielmarkland/publishing-contracts@0.7.0
  - @danielmarkland/publishing-core@0.9.0
  - @danielmarkland/design-tokens@0.4.1

## 0.4.3

### Patch Changes

- Updated dependencies [3928295]
  - @danielmarkland/publishing-core@0.8.2

## 0.4.1

### Patch Changes

- Expose a shared editorial sign-in and password recovery view; hosts supply authentication actions.

## 0.4.0

### Minor Changes

- Publish themed customer funnel controls, portable font CSS, and the shared Turnstile verification helper for independent hosted app consumers.

### Patch Changes

- Updated dependencies
  - @danielmarkland/publishing-core@0.8.1

## 0.3.0

### Minor Changes

- Add portable landing-page typography, section sizing, joined rich cards, process steps, FAQ rows, CTA bands, and header/footer presets. Existing content retains default rendering when optional settings are omitted. Bundle licensed Inter and IBM Plex Mono fonts; remove the unsuitable full-body B-tree search index in the application migration.

  Consolidate public views, base styles, font loading, navigation/icons and theme
  resolution into the publishing packages. Export one presentation-boundary policy
  for both host lint pipelines and preserve host routing, data and tenant policy.

  Centralize native CMS factories, preview handling, typed content clients, metadata/search rules, server environment and form delivery. Separate HTTP adapters from business services and enforce shared ownership in both hosts. Protect standalone CMS bootstrap and role updates; require configured tenant destinations for previews.

  Share publishing route definitions and HTTP cache/error/preview policy; standardize validation errors and conflict/upstream status contracts. Restore tenant-safe selected-post ordering in GroovePost and share form submission lifecycle with in-flight locking.

### Patch Changes

- Updated dependencies
  - @danielmarkland/design-tokens@0.4.0
  - @danielmarkland/publishing-contracts@0.6.0
  - @danielmarkland/publishing-core@0.8.0

## 0.2.0

### Minor Changes

- 492df9e: Add portable hero and section layout controls, curated artwork grids, archive presentation and pagination, and booking form fields. Preserve existing content defaults.

### Patch Changes

- Updated dependencies [492df9e]
  - @danielmarkland/publishing-contracts@0.5.0
  - @danielmarkland/publishing-core@0.7.0

## 0.1.1

### Patch Changes

- Updated dependencies
  - @danielmarkland/publishing-contracts@0.4.0
  - @danielmarkland/publishing-core@0.5.0

## 0.1.0

### Minor Changes

- Share safe navigation and post-heading helpers, page rendering, link presentation, forms and footer presentation. Applications inject icons, forms and data-loading components through explicit factories. Keep Payload dependencies optional for consumers of pure entry points.

### Patch Changes

- Updated dependencies
  - @danielmarkland/publishing-core@0.4.1

## 0.0.3

### Patch Changes

- Share editorial and navigation field factories and enumerate supported package entry points so build artifacts and tests remain private.

## 0.0.2

### Patch Changes

- Updated dependencies
  - @danielmarkland/publishing-contracts@0.3.0

## 0.0.1

### Patch Changes

- Publish shared post lists, latest-post sections, site branding and header layout, site configuration context, theme controls, public integration widgets, and Payload admin fields. Applications supply content, theme storage keys, and icon definitions. Validate post-card presentation fields in publishing contracts.
- Updated dependencies
  - @danielmarkland/publishing-contracts@0.2.0
