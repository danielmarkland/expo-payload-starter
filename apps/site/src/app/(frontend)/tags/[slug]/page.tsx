import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostArchive } from '@danielmarkland/publishing-ui/PostArchive'
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
    <PostArchive
      settings={settings}
      posts={result.docs}
      pagination={result}
      header={
        <>
          <p className="eyebrow">Tag</p>
          <h1>{tag.title}</h1>
          {tag.description ? <p className="lede">{tag.description}</p> : null}
        </>
      }
    />
  )
}
