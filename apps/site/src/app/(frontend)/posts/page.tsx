import type { Metadata } from 'next'
import { getPayload } from 'payload'

import { PostList } from '@/components/PostList'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Posts' }

export default async function PostsIndexPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

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
