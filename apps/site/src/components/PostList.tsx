import Link from 'next/link'

import type { Post } from '@/payload-types'

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="muted">No published posts yet.</p>

  return (
    <div className="page-card-grid">
      {posts.map((post) => (
        <article className="page-card" key={post.id}>
          <h2>
            <Link href={`/posts/${encodeURIComponent(post.slug)}`}>{post.title}</Link>
          </h2>
          <p>{post.summary}</p>
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          ) : null}
        </article>
      ))}
    </div>
  )
}
