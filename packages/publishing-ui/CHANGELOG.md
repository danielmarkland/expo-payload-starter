# @danielmarkland/publishing-ui

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
