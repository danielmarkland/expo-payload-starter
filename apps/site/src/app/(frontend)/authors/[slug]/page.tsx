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

async function getAuthor(slug: string) {
  return getTaxonomyDocument('authors', slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthor((await params).slug)
  return author ? { description: author.bio, title: author.name } : {}
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const author = await getAuthor((await params).slug)
  if (!author) notFound()
  const page = archivePageNumber((await searchParams).page)
  if (!page) notFound()
  const { config } = await getSitePresentation()
  const settings = config.archive
  const result = await getPublishedPosts(
    `?limit=${settings.pageSize}&page=${page}&authorId=${author.id}`,
  )
  if (page > Math.max(1, result.totalPages)) notFound()

  return (
    <EditorialArchive
      eyebrow="Author"
      title={author.name}
      description={author.bio}
      image={author.image}
      website={author.website}
      posts={result.docs}
      settings={settings}
      pagination={result}
    />
  )
}
