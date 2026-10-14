# Site and CMS

This application contains the public Next.js website and Payload Admin.

From the repository root:

```sh
pnpm run setup
pnpm dev
```

Setup asks for local/hosted, project name, and administrator email locally (or hosting organization when the hosted account has several). It generates configuration, initializes private storage and both schemas, and prepares separate CMS/customer accounts. The selected URL is printed; login credentials are stored privately in `.starter/administrator.json`. Existing content and signing keys are preserved on rerun. No GroovePost platform configuration is required.

Payload migrations own only `cms_*`, `_cms_*`, and `payload_*` tables. Product
schema changes belong in `database/migrations`.
