# expo-payload-starter

A production-oriented starter for a content-led product with one universal
authenticated application.

## Applications

- `apps/app` — Expo Router application for web, iOS, and Android.
- `apps/site` — Next.js public website, Payload CMS, preview, and admin UI.
- `packages/contracts` — stable Zod contracts shared across trust boundaries.
- `packages/core` — pure example-domain rules with no framework dependencies.
- `packages/auth` — provider-neutral identity and authorization interfaces.
- `packages/data` — typed Supabase repositories and generated database types.
- `packages/design-tokens` — framework-neutral design tokens.
- `packages/email` — typed React Email templates.
- `packages/config` — shared TypeScript settings and boundary enforcement.
- `supabase` — product database migrations, RLS policies, seeds, and functions.

## Requirements

- Node.js 22+
- pnpm 11
- Docker, for the local Supabase stack
- Supabase CLI

## Quick start

```sh
cp apps/app/.env.example apps/app/.env
cp apps/site/.env.example apps/site/.env
cp supabase/functions/.env.example supabase/functions/.env
pnpm install
supabase start
pnpm generate
pnpm dev
```

The public site runs on `http://localhost:3000`, Payload Admin on
`http://localhost:3000/admin`, and Expo on the port selected by Expo CLI.

See [docs/architecture.md](docs/architecture.md) and
[docs/database-ownership.md](docs/database-ownership.md) before adding a data
domain.

The profile flow is the included example domain. Forks can replace it by
removing its contract and rule from `contracts` and `core`, its repository from
`data`, the profile migration, and the profile query on the Expo home screen.
