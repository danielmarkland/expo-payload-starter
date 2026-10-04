import Image from 'next/image'
import Link from 'next/link'
import type { PostCard } from '@danielmarkland/publishing-contracts'

export function LatestPostsSection({
  eyebrow,
  heading,
  posts,
}: {
  eyebrow?: string | null
  heading?: string | null
  posts: readonly PostCard[]
}) {
  if (posts.length === 0) return null

  return (
    <section aria-label={heading || 'Latest posts'} className="page-section">
      <header className="section-heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{heading || 'Latest posts'}</h2>
      </header>
      <div className="page-card-grid">
        {posts.map((post) => {
          const image =
            post.meta?.image && typeof post.meta.image === 'object'
              ? post.meta.image
              : null
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
                <h3>
                  <Link href={`/posts/${encodeURIComponent(post.slug)}`}>
                    {post.title}
                  </Link>
                </h3>
                <p>{post.summary}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
