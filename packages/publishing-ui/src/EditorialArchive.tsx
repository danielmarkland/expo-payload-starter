import Image from 'next/image'
import type { ComponentProps } from 'react'
import { PostArchive } from './PostArchive.js'
import type { ApiMedia, PostCard } from '@danielmarkland/publishing-contracts'
import { PostList } from './PostList.js'
export function EditorialArchive({
  eyebrow,
  title,
  description,
  image,
  website,
  posts,
  settings,
  pagination,
}: {
  eyebrow: string
  title: string
  description?: string | null
  image?: ApiMedia | number | string | null
  website?: string | null
  posts: readonly PostCard[]
  settings?: ComponentProps<typeof PostArchive>['settings']
  pagination?: ComponentProps<typeof PostArchive>['pagination']
}) {
  const header = (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {image && typeof image === 'object' && image.url ? (
        <Image
          alt={image.alt || title}
          className="author-profile-image"
          height={image.height || 240}
          src={image.url}
          unoptimized
          width={image.width || 240}
        />
      ) : null}
      {description ? <p className="lede">{description}</p> : null}
      {website && /^https?:\/\//i.test(website) ? (
        <p>
          <a href={website} rel="noreferrer" target="_blank">
            Author website
          </a>
        </p>
      ) : null}
    </>
  )
  if (settings && pagination)
    return (
      <PostArchive
        header={header}
        posts={posts}
        settings={settings}
        pagination={pagination}
      />
    )
  return (
    <main className="archive-shell">
      <header className="page-title">{header}</header>
      <PostList posts={posts} />
    </main>
  )
}
