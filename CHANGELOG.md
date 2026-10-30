# Changelog

Implemented changes awaiting an official repository release. Ideas belong in issues.

## Unreleased

### Added

- Add visual-only Theme archive export, preview and import, plus native host-adapted upload controls. Preserve content, branding, navigation, media and versions.

- Shared native Payload admin layouts, authored title-case labels, compact dates and fields, responsive editor styles, navigation groups, page actions and unsaved-change registration.

### Fixed

- Preserve native version restores when nested search indexing acquires the editorial transfer gate in the same transaction.

- Reuse the save transaction for Payload document-lock checks so concurrent native saves do not exhaust the configured small connection pool. Preserve foreign-editor locking.

- Keep portable archive validation compatible with native editor field reordering while preserving strict field and relationship checks.

- Preserve Payload paragraph formatting when exporting and importing website content.

## 0.1.0 — 2026-10-21

### Added

- Independent publishing site/CMS and Expo app with shared publishing packages.
