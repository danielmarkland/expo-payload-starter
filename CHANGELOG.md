# Changelog

Implemented changes awaiting an official repository release. Ideas belong in issues.

## Unreleased

### Removed

- Retire the superseded production configurator, unversioned publishing API forwarding routes and separate database pooler-port setting. Keep the current setup flow, versioned API and URL-based PostgreSQL configuration.

### Changed

- Use four desktop columns for Site Settings palettes and move button settings to their own main-row Buttons tab.

- Move Typography, Colors and Logos into main-row Site Settings tabs, keep Width first in Design, and preserve canonical theme paths through a native rendering adapter.

- Tighten Design with collapsed Branding, paired font/density presets and consistent spacing between Theme and Buttons.

- Give Post Display and Integrations their own native Site Settings tabs, preserving stored field paths and behavior.

- Add consistent workflow input/action and detail-drawer spacing for compact operational forms.

- Normalize top-level native field groups to the shared unboxed editor flow, removing their full-width separators and oversized section gutters.

- Align checkboxes with neighbouring native inputs in mixed desktop rows, retaining normal alignment when controls stack.

- Place Header appearance controls in the first native Appearance tab, followed by Menu Links and Utility Links; pair Variant/Sticky Header, then Header Scrolled/Header Top.

- Apply compact table cell/button spacing globally across native admin tables rather than limiting the fix to a few workflow screens.

- Restore the reviewed Site/Design/SEO settings hierarchy and Header Menu Links/Utility Links tabs, with occasional listing/integration/appearance controls in labelled collapsibles.

- Make unmatched ordinary admin controls half-width by default, including descriptions, uploads and multi-selects, and retain half-width lone block settings.

- Lead native SEO settings with Preview and constrain Archive List Surface, Button Shape and Favicon to half-width desktop rows.

- Remove auto-generate buttons from native SEO fields while retaining manual editing and required validation.

- Require SEO Title, Description and Meta Image; remove their individual status strips and align native controls with shared action styling and image guidance.

- Arrange native SEO metadata as Title/Meta Image and half-width Description rows; retain native checks, generation and previews, with the fallback site description under Site settings.

- Limit Tag Description to half a desktop row, expanding it in narrow editors.

- Arrange Categories as paired Title/Slug, followed by separate half-width Parent and Description rows, expanding fields in narrow editors.

- Pair Author Image and Website in one responsive native row, retaining a full-width biography.

- Standardize minimal native upload controls across media editors and image/file relationship fields, including nested blocks and drawers.

- Place native media upload controls and Alt metadata side by side in wide editors, align the compact upload area with the Alt input, and retain stacked controls in narrow layouts.

- Show Custom Page CSS directly in page appearance settings instead of a separate collapsible section.

- Standardize short native admin fields across collections, globals and nested schemas; share the responsive field grid with service and creation workflows while preserving complex/conditional layouts.

- Pair related editorial controls on wide editors and match native image/file controls to small secondary actions, stacking fields in narrow editors and preserving mobile touch targets.

- Consolidate theme authoring documentation, correct authentication ownership, add explicit cache cleanup and stop retaining full Next.js builds in Turbo artifact cache.

### Added

- Add visual-only Theme archive export, preview and import, plus native host-adapted upload controls. Preserve content, branding, navigation, media and versions.

- Shared native Payload admin layouts, authored title-case labels, compact dates and fields, responsive editor styles, navigation groups, page actions and unsaved-change registration.

### Fixed

- Normalize native admin gutters, document headers, field spacing, action groups and upload dropzones while preserving upload touch targets and editor controls.

- Give the footer editor a full-width empty state, native header actions and scoped builder styles that preserve native field controls.

- Organize Forms with a clear submission status, focused empty state and advanced API documentation; fix invalid Pill nesting that caused hydration errors.

- Remove native button margins from overview draft-table actions and vertically align row content.

- Match rich-text editing to the native admin font and remove duplicate collection empty-state create actions when a header create action is present.

- Preserve native version restores when nested search indexing acquires the editorial transfer gate in the same transaction.

- Reuse the save transaction for Payload document-lock checks so concurrent native saves do not exhaust the configured small connection pool. Preserve foreign-editor locking.

- Keep portable archive validation compatible with native editor field reordering while preserving strict field and relationship checks.

- Preserve Payload paragraph formatting when exporting and importing website content.

## 0.1.0 — 2026-10-21

### Added

- Independent publishing site/CMS and Expo app with shared publishing packages.
