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

1. Expo clients authenticate directly with Supabase Auth, then send the access
   token to the versioned BFF for product-data requests.
2. The Next.js frontend invokes the same Hono BFF handlers in process; browser
   forms and Expo call `/api/v1` over HTTP.
3. BFF adapters use Payload's Local API for CMS reads and request-scoped
   Supabase clients for RLS-protected product data.
4. Payload Admin uses Payload's authenticated native API as an explicit
   protocol exception. Presentation code does not consume that API.
5. OpenAPI is generated from route schemas at `/api/v1/openapi.json`, with
   Swagger UI at `/api/v1/docs`.

## Shared code

The standalone Next.js site is the reference web implementation. Reusable
publishing behavior lives in `publishing-core`; Expo presentation remains
separate because it has different rendering and accessibility constraints.

## Package boundaries

The workspace remains a usable standalone starter. Stable contracts, design
tokens, and publishing behavior may be published; all other packages stay
workspace-private.

```text
apps -> api-client/auth/data -> core/contracts
```

- `contracts` owns wire and domain schemas.
- `api-client` owns provider-neutral HTTP transport for those contracts.
- `core` owns pure, framework-independent product rules.
- `auth` owns product identity and authorization interfaces, not provider SDKs.
- `data` owns typed Supabase repositories and generated database types.
- `design-tokens` owns framework-neutral visual values.
- `publishing-core` owns reusable Payload and site presentation behavior.
- `config` owns shared tool configuration and dependency checks.

Expo and Payload adapters stay in their applications. Packages never import
from `apps`, and `core` never imports React, Expo, Next.js, Payload, or Supabase.
