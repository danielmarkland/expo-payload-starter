import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { PostList } from '@/components/PostList'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getAuthor(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'authors',
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthor((await params).slug)
  return author ? { description: author.bio, title: author.name } : {}
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAuthor((await params).slug)
  if (!author) notFound()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      and: [{ _status: { equals: 'published' } }, { author: { equals: author.id } }],
    },
  })

  return (
    <main className="archive-shell">
      <header className="page-title">
        <p className="eyebrow">Author</p>
        <h1>{author.name}</h1>
        {author.image && typeof author.image === 'object' && author.image.url ? (
          <Image
            alt={author.image.alt || author.name}
            className="author-profile-image"
            height={author.image.height || 240}
            src={author.image.url}
            unoptimized
            width={author.image.width || 240}
          />
        ) : null}
        {author.bio ? <p className="lede">{author.bio}</p> : null}
        {author.website && /^https?:\/\//i.test(author.website) ? (
          <p>
            <a href={author.website} rel="noreferrer" target="_blank">
              Author website
            </a>
          </p>
        ) : null}
      </header>
      <PostList posts={result.docs} />
    </main>
  )
}
