import type { PayloadRequest } from 'payload'

/** The host supplies the authenticated request; all native access/hook policy runs. */
export async function publishingOverview(req: PayloadRequest) {
  const collections = ['posts', 'pages'] as const
  const available = collections.filter((slug) => req.payload.collections[slug])
  const results = await Promise.all(
    available.map(async (slug) => {
      const [drafts, recent] = await Promise.all([
        req.payload.find({
          collection: slug,
          req,
          overrideAccess: false,
          draft: true,
          where: { _status: { equals: 'draft' } },
          limit: 1,
          depth: 0,
        }),
        req.payload.find({
          collection: slug,
          req,
          overrideAccess: false,
          draft: true,
          sort: '-updatedAt',
          limit: 5,
          depth: 0,
        }),
      ])
      return {
        draft: {
          label: slug === 'posts' ? 'Posts' : 'Pages',
          count: drafts.totalDocs,
          href: `/admin/collections/${slug}`,
        },
        recent: recent.docs.map((doc) => ({
          id: String(doc.id),
          title: String(doc.title ?? doc.slug ?? doc.id),
          collection: slug === 'posts' ? 'Post' : 'Page',
          status: String(doc._status ?? 'draft'),
          updatedAt: String(doc.updatedAt),
          href: `/admin/collections/${slug}/${doc.id}`,
        })),
      }
    }),
  )
  return {
    drafts: results.map((result) => result.draft),
    recent: results
      .flatMap((result) => result.recent)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 10),
  }
}
