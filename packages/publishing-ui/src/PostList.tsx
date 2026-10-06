import Image from 'next/image'
import Link from 'next/link'
import type { PostCard } from '@danielmarkland/publishing-contracts'
export interface PostListOptions {
  imageProportion?: 'landscape' | 'square' | 'original' | null
  presentation?: 'card' | 'simple' | 'imageOnly' | null
  columns?: 'auto' | '2' | '3' | '4' | null
}
export function PostList({
  posts,
  imageProportion = 'landscape',
  presentation = 'card',
  columns = 'auto',
  headingLevel = 2,
  showDate = true,
}: PostListOptions & {
  posts: readonly PostCard[]
  headingLevel?: 2 | 3
  showDate?: boolean
}) {
  if (!posts.length) return <p className="muted">No published posts yet.</p>
  const Heading = headingLevel === 3 ? 'h3' : 'h2'
  return (
    <div
      className={`page-card-grid post-grid columns-${columns || 'auto'} post-grid-${presentation || 'card'} image-proportion-${imageProportion || 'landscape'}`}
    >
      {posts.map((post) => {
        const image =
          post.meta?.image && typeof post.meta.image === 'object'
            ? post.meta.image
            : null
        const href = `/posts/${encodeURIComponent(post.slug)}`
        return (
          <article className="page-card post-card" key={post.id}>
            {image?.url ? (
              <Link
                href={href}
                className="post-artwork-link"
                aria-label={post.title}
              >
                <Image
                  alt={image.alt || ''}
                  className="post-card-image"
                  height={image.height || 630}
                  width={image.width || 1200}
                  src={image.url}
                  unoptimized
                />
              </Link>
            ) : null}
            {presentation !== 'imageOnly' || !image?.url ? (
              <div className="post-card-copy">
                <Heading>
                  <Link href={href}>{post.title}</Link>
                </Heading>
                <p>{post.summary}</p>
                {showDate && post.publishedAt ? (
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                ) : null}
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
