import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { PostList } from '@/components/PostList'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  return category ? { description: category.description, title: category.title } : {}
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).slug)
  if (!category) notFound()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      and: [{ _status: { equals: 'published' } }, { categories: { equals: category.id } }],
    },
  })

  return (
    <main className="archive-shell">
      <header className="page-title">
        <p className="eyebrow">Category</p>
        <h1>{category.title}</h1>
        {category.description ? <p className="lede">{category.description}</p> : null}
      </header>
      <PostList posts={result.docs} />
    </main>
  )
}
