# Site and CMS

This application contains the public Next.js website and Payload Admin.

From the repository root:

```sh
cp apps/site/.env.example apps/site/.env
pnpm --filter @starter/site payload migrate
pnpm dev:site
```

- Public site: `http://localhost:3000`
- Payload Admin: `http://localhost:3000/admin`

Payload migrations own only `cms_*`, `_cms_*`, and `payload_*` tables. Product
schema changes belong in `supabase/migrations`.
