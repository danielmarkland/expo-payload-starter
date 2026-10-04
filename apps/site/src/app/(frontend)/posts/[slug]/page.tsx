import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPost } from '@/lib/getPost'
import { getSitePresentation } from '@/lib/getSiteSettings'
import { extractPostHeadings, postHeadingConverters } from '@/lib/postHeadings'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  const { metadata } = await getSitePresentation()
  const image = post.meta?.image && typeof post.meta.image === 'object' ? post.meta.image.url : null
  return {
    description: post.meta?.description || post.summary || metadata.description,
    openGraph: image ? { images: [image] } : undefined,
    title: post.meta?.title || post.title,
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  const image = post.meta?.image && typeof post.meta.image === 'object' ? post.meta.image : null
  const headings = post.showTableOfContents ? extractPostHeadings(post.body) : []
  return (
    <article className="article">
      <header>
        <p className="eyebrow">Article</p>
        <h1>{post.title}</h1>
        <p className="lede">{post.summary}</p>
        <div className="post-taxonomy">
          {post.author && typeof post.author === 'object' ? (
            <Link href={`/authors/${encodeURIComponent(post.author.slug)}`}>
              {post.author.name}
            </Link>
          ) : null}
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          ) : null}
          {post.categories?.map((category) =>
            typeof category === 'object' ? (
              <Link href={`/categories/${encodeURIComponent(category.slug)}`} key={category.id}>
                {category.title}
              </Link>
            ) : null,
          )}
        </div>
      </header>
      {image?.url ? (
        <Image
          alt={image.alt || ''}
          className="article-featured-image"
          height={image.height || 630}
          priority
          src={image.url}
          unoptimized
          width={image.width || 1200}
        />
      ) : null}
      {headings.length ? (
        <nav aria-label="Table of contents" className="article-toc">
          <h2>On this page</h2>
          <ol>
            {headings.map((heading) => (
              <li
                className={heading.level === 3 ? 'article-toc-nested' : undefined}
                key={heading.id}
              >
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="article-body">
        <RichText converters={postHeadingConverters()} data={post.body} />
      </div>
      {post.tags?.length ? (
        <ul aria-label="Tags" className="post-tags">
          {post.tags.map((tag) =>
            typeof tag === 'object' ? (
              <li key={tag.id}>
                <Link href={`/tags/${encodeURIComponent(tag.slug)}`}>{tag.title}</Link>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
    </article>
  )
}
