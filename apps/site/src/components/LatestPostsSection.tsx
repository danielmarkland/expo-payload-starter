import Image from 'next/image'
import Link from 'next/link'
import { getPublishedPosts } from '@/lib/api/content'

export async function LatestPostsSection({
  eyebrow,
  heading,
  limit,
}: {
  eyebrow?: string | null
  heading?: string | null
  limit?: number | null
}) {
  const posts = await getPublishedPosts(`?limit=${limit || 3}`)

  if (posts.docs.length === 0) return null

  return (
    <section aria-label={heading || 'Latest posts'} className="page-section">
      <header className="section-heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{heading || 'Latest posts'}</h2>
      </header>
      <div className="page-card-grid">
        {posts.docs.map((post) => {
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
                <h3>
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
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
