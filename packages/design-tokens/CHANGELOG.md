# @danielmarkland/design-tokens

## 0.4.0

### Minor Changes

- Add portable landing-page typography, section sizing, joined rich cards, process steps, FAQ rows, CTA bands, and header/footer presets. Existing content retains default rendering when optional settings are omitted. Bundle licensed Inter and IBM Plex Mono fonts; remove the unsuitable full-body B-tree search index in the application migration.

  Consolidate public views, base styles, font loading, navigation/icons and theme
  resolution into the publishing packages. Export one presentation-boundary policy
  for both host lint pipelines and preserve host routing, data and tenant policy.

  Centralize native CMS factories, preview handling, typed content clients, metadata/search rules, server environment and form delivery. Separate HTTP adapters from business services and enforce shared ownership in both hosts. Protect standalone CMS bootstrap and role updates; require configured tenant destinations for previews.

  Share publishing route definitions and HTTP cache/error/preview policy; standardize validation errors and conflict/upstream status contracts. Restore tenant-safe selected-post ordering in GroovePost and share form submission lifecycle with in-flight locking.

## 0.3.0

### Minor Changes

- 7fede23: Separate starter-specific identity and publishing schemas from the reusable
  contracts and design-token packages.

## 0.2.0

### Minor Changes

- 34e7515: Publish the shared contracts and design primitives.
