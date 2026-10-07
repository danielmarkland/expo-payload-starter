import { documentMetadata } from '@danielmarkland/publishing-core/publishingRules'
import { Article } from '@danielmarkland/publishing-ui/Article'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPost } from '@/lib/getPost'
import { getSitePresentation } from '@/lib/getSiteSettings'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  const { metadata } = await getSitePresentation()
  return documentMetadata(post, metadata.description)
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  return <Article post={post} />
}
