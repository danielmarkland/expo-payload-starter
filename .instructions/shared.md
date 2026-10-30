# expo-payload-starter — Shared Agent Instructions

This file is the canonical shared project guide for AI coding agents. Root
`AGENTS.md` and `CLAUDE.md` point here. Before editing a subdirectory, check for
more-specific `AGENTS.md` or `CLAUDE.md` instructions and follow them too.

## Project Context

This is a pnpm monorepo starter for a content-led product with one universal,
authenticated application. It is intended to be easy to fork and configure, not
to become a plugin framework.

- `apps/app/` — Expo Router app for web, iOS, and Android.
- `apps/site/` — Next.js public site, Payload CMS, preview, and admin UI.
- `packages/contracts/` — example product-domain schemas, published as `@danielmarkland/contracts`.
- `packages/publishing-contracts/` — reusable publishing and site-presentation schemas, published as `@danielmarkland/publishing-contracts`.
- `packages/api-client/` — framework-neutral client for the versioned BFF.
- `packages/core/` — framework-independent product rules.
- `packages/auth/` — provider-neutral identity and authorization interfaces.
- `packages/auth-runtime/` — public Better Auth backend/client package; realm isolation lives here. The starter hosts its own Better Auth backend.
- `packages/data/` — scoped PostgreSQL profile repositories.
- `packages/brand/` — private starter identity, icons, and theme preference key.
- `packages/design-tokens/` — neutral visual tokens and fonts, published as `@danielmarkland/design-tokens`.
- `packages/publishing-core/` — reusable publishing behavior for Payload-backed sites, published as `@danielmarkland/publishing-core`.
- `packages/config/` — shared tooling configuration and boundary checks.
- `database/` — portable product/identity migrations and actor/realm policies.

## Architecture and Trust Boundaries

Read `docs/architecture.md` and, when relevant, `docs/database-ownership.md`
before changing application boundaries, database ownership, authentication,
storage, or email delivery. Those documents are the detailed architecture
references; this file captures the agent-facing guardrails.

- Keep product-user identity and product data in Neon PostgreSQL. Keep editorial
  content and CMS editor accounts in Payload. Payload users and product users
  are separate identities; starter-specific identity belongs to the private
  brand package.
- Better Auth is the identity provider; configuration is documented
  in `docs/authentication.md`. Customer and editorial realms are separate.
  PostgreSQL actor/realm policies authorize server data access. Route guards are
  navigation behavior, not authorization. Preserve stable IDs during migration.
- Payload access functions authorize CMS documents. Payload auth is only for
  editors and CMS administrators.
- Keep migration, runtime database, S3, and Resend credentials server-side.
  Never expose them with an `EXPO_PUBLIC_` variable or in client bundles.
- Application data flows through the versioned Hono BFF. Better Auth and
  Payload Admin's authenticated transport are explicit protocol exceptions.
  Privileged product workflows still belong in narrowly scoped server code.
- Keep database migration ownership separate: Product migrations may alter
  product tables in the `app` and private `identity` schemas ;
  Payload migrations own Payload tables in `public`. Never alter the other
  system's tables with the wrong migration tool, and avoid cross-owner foreign
  keys. See `docs/database-ownership.md` for details.
- Keep Expo presentation platform-specific. Share reusable publishing behavior
  and web presentation only through explicitly published packages.
- Packages do not import from `apps/`; `core` remains framework- and provider-
  independent. Keep adapters in the applications.

## Shared Brand and Theme

- `packages/brand/src/brand.json` is the source for product/site names,
  descriptions, theme preference key, and asset references.
- `packages/design-tokens/src/tokens.json` is the source for light/dark colors,
  typography, spacing, radii, and layout values.
- Starter image and icon files live in `packages/brand/assets/`. Reusable fonts
  live in `packages/design-tokens/assets/fonts/`.
- After changing tokens, regenerate CSS with
  `pnpm --filter @danielmarkland/design-tokens generate:css`. `pnpm check` verifies
  generated output is current.
- Platform-specific identity such as Expo slug, URL scheme, and native package
  IDs stays in `apps/app/app.config.js`.

## Implementation and Verification

### Git and release workflow

- Never commit or push changes directly to `main` or `develop`, or bypass checks.
- Start branches from current `develop`. Agents use isolated worktrees and
  `codex/<task>` branches; humans may use `<type>/<short-description>`.
  Follow `docs/release-runbook.md` for release ownership and checks. Never reset
  another checkout.
- Open feature pull requests into `develop` and squash-merge them.
- Release through a pull request from `develop` into `main`. Use a merge commit
  for releases to preserve shared branch ancestry.
- Deploy and verify releases from `main` after the release pull request is merged.
- The designated release agent serializes authorized merges and pauses develop
  during production finalization. Require `ci`; merges and builds do not establish
  hosted production acceptance.
- Keep credentials environment-scoped. Release summaries record exact evidence
  and unmet prerequisites; never claim deferred SMS or simulated services passed.
- Attribute commits to Daniel Markland <daniel@codeassassins.com>.
- Do not commit Monday–Friday between 08:00 inclusive and 16:00 exclusive in
  `America/Chicago`. Editing, testing, and staging are allowed during that window.
  Check the current time immediately before committing and use actual timestamps.
- Commit, push, pull request creation, merging, publication, and deployment require
  the applicable user authorization. These workflow rules do not authorize delivery
  actions by themselves.

### Checks and change scope

- Use pnpm from the repository root; do not introduce a second package manager.
- Add or update tests when behavior changes. Keep tests aligned with the owning
  package or application.
- Review `README.md` for every code change and update it in the same change when
  behavior, commands, setup, configuration, architecture, or user-facing
  capabilities are affected. If no README edit is needed, explicitly confirm
  that the review was performed when handing off the work.
- Run `pnpm check` before handing off code changes. If an environment
  restriction prevents part of the check, report the exact failure and what
  could not be verified.
- Update the relevant README or architecture documentation when changing setup
  steps, package ownership, security boundaries, or architecture decisions.
- Preserve existing user changes. Inspect `git status` before editing; do not
  discard, reset, stash, or overwrite work that is not part of the requested
  task.
- Do not commit or push unless the user explicitly asks for that operation.
- For commit, push, or pull/merge request tasks, follow
  `.agents/skills/git-delivery/SKILL.md`. Treat each step as separately
  authorized unless the user's current request explicitly names multiple steps.
- Keep changes within the request, and explain any blocker that requires
  additional authority or a user decision.

## Focused References

- `docs/architecture.md` — app boundaries, data flow, trust boundaries, and
  package ownership.
- `docs/database-ownership.md` — ownership and migration guidance for data.
- `README.md` — local development, deployment, shared brand guide, and fork
  checklist.

## Changelog maintenance

Update root `CHANGELOG.md` under `Unreleased` for noteworthy implemented changes
in the same PR. Keep ideas in issues. For maintenance-only changes, explain in
the PR why no entry is needed. Follow `docs/release-runbook.md`; tags, package
publication and production deployments require explicit release authorization.

## Reviewed admin presentation

For admin changes, read the pinned [Admin UI Guidelines](https://github.com/groovepost/Admin-Mock/blob/d942da618120963d6442a673b27cef57bd500a12/docs/admin-ui-guidelines.md) and [Platform Integration Handoff](https://github.com/groovepost/Admin-Mock/blob/d942da618120963d6442a673b27cef57bd500a12/docs/implementation-handoff.md). Preserve real capabilities absent from the mock and use shared native Payload presentation helpers. The platform gap audit in [groovepost/platform](https://github.com/groovepost/platform/tree/codex/admin-mock-integration/docs/admin-integration) records integration status; a mock success does not establish operational acceptance.

## Publishing presentation ownership

- `publishing-contracts` owns portable schemas; `design-tokens` owns design tokens and licensed font assets; `publishing-core` owns reusable theme resolution and content rules; `publishing-ui` owns public markup, CSS, font loading, icons, and navigation presentation.
- Website routes, public components and presentation helpers are adapters: fetch content, enforce access/tenant policy, resolve metadata and destinations, then invoke shared views. Do not add host DOM markup, CSS rules, icon registries, or theme resolvers. The frontend root layout may render document shell tags and inject the shared theme CSS. Reusable CMS controls and publishing workflows are shared too. Hosts retain Payload route/import-map wiring and application-specific administration, authentication, storage and access policy. The starter must administer its own content independently of GroovePost.
- Extend shared package exports before adding capabilities to either host. Keep deployment destinations in environment configuration or tenant records.
- Both repositories run the same `publishing-core/presentationBoundary` policy during lint. Add acceptance/rejection coverage when changing the boundary; do not bypass it with local renderer copies.
- Use shared publishing collection/global factories and preview/content/form helpers. Business services must not import HTTP API modules.

Before changing site code, read the installed Next.js guide required by `apps/site/AGENTS.md`.

## Project context and authoritative sources

- Project Drive: [Daniel Markland HQ](https://drive.google.com/drive/folders/13UgJ-KiXNNJEHjHfMl6FKVri3WrT3Qfq).
- Follow the shared portfolio standards in [Portfolio HQ — Strategy](https://docs.google.com/document/d/1Rh232DqxZuRfAow3Lia573h1cQmcUdx72fekVctdnHY/edit); reference those standards rather than copying business documents here.
- Google Workspace is authoritative for business/product strategy, requirements, specifications, research, planning, and major decisions. GitHub is authoritative for code, implemented architecture, configuration, issues, PRs, and development task status.
- Before substantive work, retrieve the relevant current project documents through configured Drive tools; do not rely solely on memory. Keep repository documentation focused on implementation.
- Links do not grant access. If retrieval fails, stop dependent work, report the failure, and never claim inaccessible documents were read. Verify actual access independently in each Codex and Claude Code environment, including fresh-session retrieval.
- Keep context concise and link to authoritative documents rather than duplicating them. Ask Daniel before resolving substantive conflicts between sources; record significant business/product decisions in Drive and implementation work in GitHub.
