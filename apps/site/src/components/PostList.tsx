import Image from 'next/image'
import Link from 'next/link'

import type { Post } from '@/payload-types'

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="muted">No published posts yet.</p>

  return (
    <div className="page-card-grid">
      {posts.map((post) => {
        const image =
          post.meta?.image && typeof post.meta.image === 'object' ? post.meta.image : null
        return (
          <article className="page-card post-card" key={post.id}>
            {image?.url ? (
              <Image
                alt={image.alt || ''}
                className="post-card-image"
                height={image.height || 630}
                src={image.url}
                unoptimized
                width={image.width || 1200}
              />
            ) : null}
            <div className="post-card-copy">
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
            </div>
          </article>
        )
      })}
    </div>
  )
}
