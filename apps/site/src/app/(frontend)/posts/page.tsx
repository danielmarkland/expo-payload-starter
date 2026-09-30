import type { Metadata } from 'next'

import { PostList } from '@/components/PostList'
import { getPublishedPosts } from '@/lib/api/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Posts' }

export default async function PostsIndexPage() {
  const result = await getPublishedPosts('?limit=100')

  return (
    <main className="archive-shell">
      <header className="page-title">
        <p className="eyebrow">From the blog</p>
        <h1>Posts</h1>
      </header>
      <PostList posts={result.docs} />
    </main>
  )
}
