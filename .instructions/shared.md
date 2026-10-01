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
- `packages/contracts/` — stable schemas shared across trust boundaries and published as `@danielmarkland/contracts`.
- `packages/api-client/` — framework-neutral client for the versioned BFF.
- `packages/core/` — framework-independent product rules.
- `packages/auth/` — provider-neutral identity and authorization interfaces.
- `packages/data/` — typed Supabase repositories and generated database types.
- `packages/design-tokens/` — shared brand metadata, visual tokens, and assets, published as `@danielmarkland/design-tokens`.
- `packages/publishing-core/` — reusable tenant publishing behavior shared by the standalone site and GroovePost, published as `@danielmarkland/publishing-core`.
- `packages/config/` — shared tooling configuration and boundary checks.
- `supabase/` — product database migrations, RLS policies, seeds, and functions.

## Architecture and Trust Boundaries

Read `docs/architecture.md` and, when relevant, `docs/database-ownership.md`
before changing application boundaries, database ownership, authentication,
storage, or email delivery. Those documents are the detailed architecture
references; this file captures the agent-facing guardrails.

- Keep product-user identity and product data in Supabase. Keep editorial
  content and CMS editor accounts in Payload. Payload users and product users
  are separate identities; shared product/brand metadata belongs to the design
  tokens package.
- Supabase Auth is the product-user identity provider. RLS authorizes product
  rows and storage objects. Client route guards are navigation behavior, not
  authorization.
- Payload access functions authorize CMS documents. Payload auth is only for
  editors and CMS administrators.
- Keep service-role, Payload database, S3, and Resend credentials server-side.
  Never expose them with an `EXPO_PUBLIC_` variable or in client bundles.
- Application data flows through the versioned Hono BFF. Supabase Auth and
  Payload Admin's authenticated transport are explicit protocol exceptions.
  Privileged product workflows still belong in narrowly scoped server code.
- Keep database migration ownership separate: Supabase migrations may alter
  product tables in the `app` schema and Supabase-owned storage policies;
  Payload migrations own Payload tables in `public`. Never alter the other
  system's tables with the wrong migration tool, and avoid cross-owner foreign
  keys. See `docs/database-ownership.md` for details.
- Keep Expo presentation platform-specific. The Next.js tenant site and
  GroovePost may share publishing behavior and web presentation through
  explicitly published packages.
- Packages do not import from `apps/`; `core` remains framework- and provider-
  independent. Keep adapters in the applications.

## Shared Brand and Theme

- `packages/design-tokens/src/brand.json` is the source for shared product/site
  names, descriptions, theme preference key, and asset references.
- `packages/design-tokens/src/tokens.json` is the source for light/dark colors,
  typography, spacing, radii, and layout values.
- Shared image, icon, and font files live in `packages/design-tokens/assets/`.
- After changing tokens, regenerate CSS with
  `pnpm --filter @danielmarkland/design-tokens generate:css`. `pnpm check` verifies
  generated output is current.
- Platform-specific identity such as Expo slug, URL scheme, and native package
  IDs stays in `apps/app/app.config.js`.

## Implementation and Verification

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
