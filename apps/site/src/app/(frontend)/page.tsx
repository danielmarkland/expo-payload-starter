import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 12,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  return (
    <div className="shell">
      <header className="hero">
        <p className="eyebrow">Expo · Payload · Supabase · Resend</p>
        <h1>Ship one product across web, iOS, and Android.</h1>
        <p className="lede">
          A production-minded starter with a universal authenticated app and a content-first public
          site.
        </p>
        <div className="actions">
          <a className="primary" href={process.env.NEXT_PUBLIC_APP_URL || '#'}>
            Open app
          </a>
          <Link className="secondary" href="/admin">
            CMS admin
          </Link>
        </div>
      </header>
      <section aria-labelledby="latest-posts" className="posts">
        <h2 id="latest-posts">Latest posts</h2>
        {posts.docs.length === 0 ? (
          <p className="muted">Publish your first post in Payload Admin.</p>
        ) : (
          <div className="grid">
            {posts.docs.map((post) => (
              <article className="card" key={post.id}>
                <h3>
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.summary}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
