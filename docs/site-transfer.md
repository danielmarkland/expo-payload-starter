# Full-site export and replacement

The server-only `publishing-core/siteTransfer` entry point exports a complete
supported site as an uncompressed `.tar` archive containing `site.json` and media
originals. `publishing-contracts/siteTransfer` defines format version 1. No merge
or individual record selection is supported.

Included: pages and blocks, posts, editorial authors, categories, tags, navigation,
presentation settings, SEO, redirects, media, and current draft/published states.
Search and image derivatives are rebuilt. User accounts, integration settings,
newsletter group IDs, credentials, and historical revisions are excluded. Unknown
blocks, rich-text nodes/properties, versions, or required extensions fail rather
than silently losing data. A destination must have exactly matching resources
and extension versions. The current limits are 1 GiB per archive, 32 MiB manifest,
512 MiB per original asset, and 100,000 records/assets.

Run the Payload migrations and regenerate types after updating. The hidden
`publishing-transfer-gates` collection serializes normal editorial writes and
transfers through transactional row locks. Applications must install the gate
plugin for all covered collections/globals; adapter consumers must provide a
write lock that covers their complete scope. Do not call the low-level engine
without enforcing those locks. A process crash releases the transaction lock.
The first concurrent attempt to create a gate may fail on uniqueness; retry it.

For the standalone operator CLI, configure the usual server database/media
credentials plus `SITE_TRANSFER_DESTINATION_LABEL` (an explicit environment name)
and `SITE_TRANSFER_BACKUP_DIR` (persistent private storage). Never expose these
credentials to clients. Commands run with trusted server privileges:

```sh
pnpm --filter @starter/site site:transfer export --output site.tar
pnpm --filter @starter/site site:transfer preview --file site.tar --output preview.json
pnpm --filter @starter/site site:transfer apply --file site.tar --preview preview.json --confirm-destination development
```

Preview creates no destination content changes. Application rejects a changed
archive or destination, verifies a backup, then replaces all covered records,
removing destination-only records. Database IDs change; references are remapped.
The backup path is returned. Restore by previewing and applying that backup as
another site package. Keep backups private and retain them for at least 30 days.
Old media bytes are intentionally retained to keep rollback and backups valid;
automated storage garbage collection is not yet provided.

Hosts with outbound hooks must honor `req.context.suppressIntegrationSideEffects`
without skipping validation. Registered adapters use explicit field allowlists;
never infer export coverage from entire stored documents. Raw external URLs remain
literal and are never fetched as archive assets. Internal document and upload
references are portable. When the adapter supplies its source origin, same-origin
navigation and rich-text links become relative paths. External URLs remain literal.

Run the real transaction tests only against their named disposable local database:

```sh
SITE_TRANSFER_TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/publishing_site_transfer_tests \
  pnpm --filter @starter/site test:site-transfer
```

The suite uses schema push only inside that guarded disposable database. It must
never be pointed at a working site. Coverage includes populated replacement,
media, draft/published separation, repeat imports, stale previews, restore, search,
and injected failure with database rollback and original media retention.
