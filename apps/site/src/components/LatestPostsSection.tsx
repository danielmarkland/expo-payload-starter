import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function LatestPostsSection({
  heading,
  limit,
}: {
  heading?: string | null
  limit?: number | null
}) {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: limit || 3,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  if (posts.docs.length === 0) return null

  return (
    <section aria-label={heading || 'Latest posts'} className="page-section">
      <header className="section-heading">
        <h2>{heading || 'Latest posts'}</h2>
      </header>
      <div className="page-card-grid">
        {posts.docs.map((post) => (
          <article className="page-card" key={post.id}>
            <h3>
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h3>
            <p>{post.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
