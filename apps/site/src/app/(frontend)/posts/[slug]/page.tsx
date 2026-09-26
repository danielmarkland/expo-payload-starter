import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

interface Props {
  params: Promise<{ slug: string }>
}

async function findPost(slug: string) {
  const { isEnabled } = await draftMode()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: isEnabled,
    limit: 1,
    overrideAccess: isEnabled,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(isEnabled ? [] : [{ _status: { equals: 'published' as const } }]),
      ],
    },
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPost((await params).slug)
  if (!post) return {}
  return {
    description: post.seo?.description || post.summary,
    title: post.seo?.title || post.title,
  }
}

export default async function PostPage({ params }: Props) {
  const post = await findPost((await params).slug)
  if (!post) notFound()
  return (
    <article className="article">
      <header>
        <p className="eyebrow">Article</p>
        <h1>{post.title}</h1>
        <p className="lede">{post.summary}</p>
      </header>
      <div className="article-body">
        <RichText data={post.body} />
      </div>
    </article>
  )
}
