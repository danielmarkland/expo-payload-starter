# Database ownership

Each deployment environment has its own Neon project. Product profiles and their fixed identity context live in `app`; native Better Auth records live in private `identity`; Payload owns `public.cms_*` and `public.payload_*`. This starter hosts and administers its own content independently of GroovePost.

Product migrations in `database/migrations` use `pnpm database:migrate` with a direct privileged `DATABASE_MIGRATION_URL`. Payload uses its checked-in migrations and `push: false`. Runtime uses a separate pooled login with membership in `starter_payload`, `starter_product_runtime` and `identity_runtime`; product and identity transactions switch roles and set verified actor/realm context. Browsers receive no database or storage credentials. There are no cross-owner foreign keys.

Code and schema changes follow feature MR -> develop -> main. Development and production databases, identities, files and secrets remain separate; promotion never replaces production data with development data. Rehearse migrations on isolated Neon branches before applying them during controlled releases. Buckets (`cms-media`, `app-uploads`, `site-transfer-archives`) remain private, with host authorization or expiring signed URLs.
