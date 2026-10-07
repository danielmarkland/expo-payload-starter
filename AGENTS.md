# expo-payload-starter agent entrypoint

Read and follow `.instructions/shared.md` before working in this repository.
Before editing a subdirectory, check for more-specific `AGENTS.md` or
`CLAUDE.md` instructions there and follow those as well.

## Publishing presentation ownership

- `publishing-contracts` owns portable schemas; `design-tokens` owns design tokens and licensed font assets; `publishing-core` owns reusable theme resolution and content rules; `publishing-ui` owns public markup, CSS, font loading, icons, and navigation presentation.
- Website routes, public components and presentation helpers are adapters: fetch content, enforce access/tenant policy, resolve metadata and destinations, then invoke shared views. Do not add host DOM markup, CSS rules, icon registries, or theme resolvers. The frontend root layout may render document shell tags and inject the shared theme CSS. Reusable CMS controls and publishing workflows are shared too. Hosts retain Payload route/import-map wiring and application-specific administration, authentication, storage and access policy. The starter must administer its own content independently of GroovePost.
- Extend shared package exports before adding capabilities to either host. Keep deployment destinations in environment configuration or tenant records.
- Both repositories run the same `publishing-core/presentationBoundary` policy during lint. Add acceptance/rejection coverage when changing the boundary; do not bypass it with local renderer copies.

- Use shared publishing collection/global factories and preview/content/form helpers. Keep host authentication, tenancy and storage adapters explicit. Business services must not import HTTP API modules; run the shared publishing boundary lint checks. The public starter must administer its publishing content independently.
