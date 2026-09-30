import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostList } from '@/components/PostList'
import { getPublishedPosts, getTaxonomyDocument } from '@/lib/api/content'
import type { Tag } from '@/payload-types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getTag(slug: string) {
  return (await getTaxonomyDocument('tags', slug)) as Tag | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTag((await params).slug)
  return tag ? { description: tag.description, title: tag.title } : {}
}

export default async function TagPage({ params }: Props) {
  const tag = await getTag((await params).slug)
  if (!tag) notFound()
  const result = await getPublishedPosts(`?limit=100&tagId=${tag.id}`)

  return (
    <main className="archive-shell">
      <header className="page-title">
        <p className="eyebrow">Tag</p>
        <h1>{tag.title}</h1>
        {tag.description ? <p className="lede">{tag.description}</p> : null}
      </header>
      <PostList posts={result.docs} />
    </main>
  )
}
