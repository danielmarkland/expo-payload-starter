import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { PostList } from '@/components/PostList'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getTag(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'tags',
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTag((await params).slug)
  return tag ? { description: tag.description, title: tag.title } : {}
}

export default async function TagPage({ params }: Props) {
  const tag = await getTag((await params).slug)
  if (!tag) notFound()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      and: [{ _status: { equals: 'published' } }, { tags: { equals: tag.id } }],
    },
  })

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
