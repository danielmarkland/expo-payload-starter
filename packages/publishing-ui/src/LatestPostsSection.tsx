import type { ReactNode } from 'react'
import type {
  ApiPageBlock,
  PostCard,
} from '@danielmarkland/publishing-contracts'
import { PostList } from './PostList.js'
export type LatestPostsOptions = Pick<
  Extract<ApiPageBlock, { blockType: 'latestPosts' }>,
  | 'eyebrow'
  | 'heading'
  | 'source'
  | 'limit'
  | 'category'
  | 'selectedPosts'
  | 'imageProportion'
  | 'presentation'
  | 'appearance'
  | 'action'
>
export function LatestPostsSection({
  eyebrow,
  heading,
  posts,
  imageProportion,
  presentation,
  appearance,
  actionElement,
}: LatestPostsOptions & {
  posts: readonly PostCard[]
  actionElement?: ReactNode
}) {
  if (!posts.length) return null
  return (
    <section aria-label={heading || 'Latest posts'} className="page-section">
      <header className="section-heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{heading || 'Latest posts'}</h2>
      </header>
      <PostList
        posts={posts}
        imageProportion={imageProportion}
        presentation={presentation}
        columns={appearance?.columns}
        headingLevel={3}
        showDate={false}
      />
      {actionElement}
    </section>
  )
}
