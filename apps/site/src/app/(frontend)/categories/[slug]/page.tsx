import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EditorialArchive } from '@danielmarkland/publishing-ui/EditorialArchive'
import { archivePageNumber } from '@danielmarkland/publishing-core/postSelection'
import { getSitePresentation } from '@/lib/getSiteSettings'
import { getPublishedPosts, getTaxonomyDocument } from '@/lib/api/content'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

async function getCategory(slug: string) {
  return getTaxonomyDocument('categories', slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  return category ? { description: category.description, title: category.title } : {}
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategory((await params).slug)
  if (!category) notFound()
  const page = archivePageNumber((await searchParams).page)
  if (!page) notFound()
  const { config } = await getSitePresentation()
  const settings = config.archive
  const result = await getPublishedPosts(
    `?limit=${settings.pageSize}&page=${page}&categoryId=${category.id}`,
  )
  if (page > Math.max(1, result.totalPages)) notFound()

  return (
    <EditorialArchive
      eyebrow="Category"
      title={category.title}
      description={category.description}
      posts={result.docs}
      settings={settings}
      pagination={result}
    />
  )
}
