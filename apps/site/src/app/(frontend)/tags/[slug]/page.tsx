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

async function getTag(slug: string) {
  return getTaxonomyDocument('tags', slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTag((await params).slug)
  return tag ? { description: tag.description, title: tag.title } : {}
}

export default async function TagPage({ params, searchParams }: Props) {
  const tag = await getTag((await params).slug)
  if (!tag) notFound()
  const page = archivePageNumber((await searchParams).page)
  if (!page) notFound()
  const { config } = await getSitePresentation()
  const settings = config.archive
  const result = await getPublishedPosts(`?limit=${settings.pageSize}&page=${page}&tagId=${tag.id}`)
  if (page > Math.max(1, result.totalPages)) notFound()

  return (
    <EditorialArchive
      eyebrow="Tag"
      title={tag.title}
      description={tag.description}
      posts={result.docs}
      settings={settings}
      pagination={result}
    />
  )
}
