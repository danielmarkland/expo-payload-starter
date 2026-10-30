# Admin presentation acceptance evidence

Reference: Admin-Mock `d942da618120963d6442a673b27cef57bd500a12`.

The screenshots show the real standalone starter, backed by disposable local
Postgres and its existing Better Auth editorial login. They do not show the
platform's hosted tenant integrations or establish production acceptance.

- `safari-overview-dark.png`: desktop Safari 26.6.2, explicit native Dark preference.
- `safari-responsive-overview.png`: Safari Responsive Design Mode, 390 × 844.
- `safari-responsive-validation.png`: native required Title/Layout/Slug validation.

Phone-width navigation opens as an overlay, closes without navigating, and leaves
content/actions available. Tables scroll within their container. Native page
creation, block picking, required validation, rich text editing and Save Draft
were exercised in Safari. The resulting saved draft and Versions entry were visible, but the Mac locked before their screenshot could be saved. Only local disposable content was created. This is desktop Safari's responsive mode, not an iPhone
Safari acceptance result. Access to Device Hub was denied; no further attempt was
made. The Mac subsequently locked, ending native UI automation.

## Automated verification

`pnpm check` passed in the standalone starter before the evidence-only updates.
The publishing core has 104 passing tests and publishing UI has 111 passing
tests. The standalone site has 90 passing tests and one skipped test. Seven
package archive/entry-point checks pass. Production Next.js and Expo web builds
pass. Optional identity-provider tests remain skipped without their test database.

Shared tests cover exact persisted paths and schema callbacks, unknown/custom
field preservation, navigation, scoped overview reads, immutable form definition
updates, pinned submission versions/review revisions, native dirty-state
registration, workflow navigation/unload protection, drawer-close/Escape cancellation and discard, and the guarded list-action
integration against the pinned native UI bundle.

Portable archive validation now compares structured state independently of
object-key and relationship-discovery order. Unknown fields, invalid relationships,
content array order and duplicate/missing references remain validated. Real host
archive/import/restore regressions additionally exercise the shared candidate.

## Open acceptance blockers

Safari Automatic theme resolves the root attribute to Dark after server rendering,
but some native control aliases retain light colors. Explicit Dark renders
correctly. This remains an open acceptance defect, not a completed Safari check;
experimental token overrides that did not fix it were removed. Do not infer that
changing the test account preference fixes the product defect.

The complete platform screen/field/workflow audit and hosting acceptance gaps live
in the companion platform PR under `docs/admin-integration/`. Package publication,
platform dependency pins, live operational service checks, actual mobile Safari,
complete native publish/version recovery, relationship/upload acceptance and all
remaining audit gaps are required before rollout. No package publication or
production deployment occurred.
