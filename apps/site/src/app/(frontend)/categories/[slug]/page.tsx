import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostList } from '@/components/PostList'
import { getPublishedPosts, getTaxonomyDocument } from '@/lib/api/content'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  return getTaxonomyDocument('categories', slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  return category ? { description: category.description, title: category.title } : {}
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).slug)
  if (!category) notFound()
  const result = await getPublishedPosts(`?limit=100&categoryId=${category.id}`)

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
