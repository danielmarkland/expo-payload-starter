# Architecture

## Surfaces

The public website and the authenticated product are separate deployable
surfaces. Next.js and Payload own public content, SEO, preview, and editor
workflows. Expo owns the authenticated web, iOS, and Android experience.

## Trust boundaries

- Supabase Auth is the only product-user identity provider.
- Payload auth is only for editors and CMS administrators.
- Expo route guards are navigation behavior, not authorization.
- Supabase RLS authorizes product rows and Storage objects.
- Payload access functions authorize CMS documents.
- Server credentials never use an `EXPO_PUBLIC_` prefix.

## Data flow

1. Expo clients authenticate with Supabase and access product tables under RLS.
2. Public Next.js pages use Payload's Local API on the server.
3. Published CMS content can be exposed through Payload REST endpoints.
4. Privileged product workflows use narrowly scoped Supabase Edge Functions.
5. The public contact form uses a narrow server-only Next.js endpoint. There is
   no generic client-callable email or admin endpoint.

## Shared code

Share contracts and design values. Do not force the Next.js
site and Expo app to share presentation components: they have different
rendering, accessibility, and deployment constraints.

## Package boundaries

The reusable packages are private workspace packages intended to make a fork
easy to understand and change, not to form a plugin framework.

```text
apps -> auth/data -> core/contracts
```

- `contracts` owns wire and domain schemas.
- `core` owns pure, framework-independent product rules.
- `auth` owns product identity and authorization interfaces, not provider SDKs.
- `data` owns typed Supabase repositories and generated database types.
- `design-tokens` owns framework-neutral visual values.
- `config` owns shared tool configuration and dependency checks.

Expo and Payload adapters stay in their applications. Packages never import
from `apps`, and `core` never imports React, Expo, Next.js, Payload, or Supabase.
