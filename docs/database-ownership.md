# Database ownership

Payload and Supabase share a Postgres database, but never share table ownership.
Product tables live in the Data API's `app` schema. Payload remains in `public`,
so this does not depend on Payload's experimental custom-schema support.

| Owner    | Tables                                | Migration tool     | Client access          |
| -------- | ------------------------------------- | ------------------ | ---------------------- |
| Supabase | `app` schema and Storage policies     | Supabase CLI       | RLS-protected Data API |
| Payload  | `public.cms_*` and `public.payload_*` | Payload migrations | Payload APIs only      |

Rules:

1. A migration may alter only tables owned by its tool.
2. Payload collection `dbName` values use the `cms_` prefix.
3. Payload's Postgres adapter must keep `push: false`; automatic schema push can
   remove tables it does not recognize.
4. Revoke `anon` and `authenticated` grants on Payload-owned tables.
5. Product migrations grant only the operations required by their RLS policies;
   do not rely on Supabase's default public-schema ACLs.
6. Avoid foreign keys across ownership boundaries. Store stable UUID references.
7. Use separate runtime and migration credentials in hosted environments.
8. Test RLS with anonymous, owning, non-owning, and service-role sessions.

The included SQL migration establishes the product profile table and defensive
grants. Payload generates and applies its own migrations separately.
