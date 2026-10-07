import type { Metadata } from 'next'

import { EditorialArchive } from '@danielmarkland/publishing-ui/EditorialArchive'
import { getPublishedPosts } from '@/lib/api/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Posts' }

export default async function PostsIndexPage() {
  const result = await getPublishedPosts('?limit=100')

  return (
    <EditorialArchive
      eyebrow="From the blog"
      title={'Posts'}
      description={undefined}
      posts={result.docs}
    />
  )
}
