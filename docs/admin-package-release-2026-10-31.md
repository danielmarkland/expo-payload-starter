# Admin publishing package development release

Scope: shared PR #91 only. Daniel authorized merge, publishing-package publication and shared development deployment on October 31, 2026. Platform PR #199 remains open for review; no platform merge/deployment or production release is authorized here.

Candidates: publishing-core 0.18.0 and publishing-ui 0.14.0. Immutable registry checks verify unchanged public packages and identify these two versions as new candidates. Changesets updates the private starter site to 1.0.39 alongside its workspace dependencies.

Release preparation reconciles stale Site Settings browser expectations with the selected main-row tabs/four-column palettes. Published test content uses real uploaded fixture images for required SEO metadata; no existing hosted content is backfilled. New operator-bootstrap homepages remain drafts until an editor supplies required SEO metadata and publishes them.

Local validation runs against an isolated, localhost-only PostgreSQL container with disposable test credentials. Required pnpm check passes formatting, lint, types, integration suites and all package/site/Expo builds. Core 108, UI 120, starter site 91 and auth-runtime 13 tests pass. Hosted CI, exact-head merge, publication and development smoke results must still be recorded before release completion.
