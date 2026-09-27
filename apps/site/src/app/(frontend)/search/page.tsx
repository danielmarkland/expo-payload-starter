import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'Search',
}

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const query = (await searchParams).q?.trim().slice(0, 120) || ''
  const results: { href: string; id: number; summary: string; title: string }[] = []

  if (query.length >= 2) {
    const payload = await getPayload({ config })
    const searchResults = await payload.find({
      collection: 'search',
      depth: 0,
      limit: 20,
      overrideAccess: false,
      sort: '-priority',
      where: {
        or: [{ title: { like: query } }, { searchText: { like: query } }],
      },
    })

    for (const result of searchResults.docs) {
      const { relationTo, value } = result.doc
      if (typeof value !== 'number') continue

      if (relationTo === 'pages') {
        const page = await payload
          .findByID({
            collection: 'pages',
            id: value,
            overrideAccess: false,
          })
          .catch(() => null)
        if (page?._status === 'published') {
          results.push({
            href: page.slug === 'home' ? '/' : `/${encodeURIComponent(page.slug)}`,
            id: result.id,
            summary: result.excerpt || '',
            title: page.meta?.title || page.title,
          })
        }
      } else if (relationTo === 'posts') {
        const post = await payload
          .findByID({
            collection: 'posts',
            id: value,
            overrideAccess: false,
          })
          .catch(() => null)
        if (post?._status === 'published') {
          results.push({
            href: `/posts/${encodeURIComponent(post.slug)}`,
            id: result.id,
            summary: result.excerpt || post.summary,
            title: post.meta?.title || post.title,
          })
        }
      }
    }
  }

  return (
    <main className="archive-shell">
      <header className="page-title">
        <p className="eyebrow">Site search</p>
        <h1>Search</h1>
      </header>
      <form action="/search" className="search-form" role="search">
        <label htmlFor="site-search">Search pages and posts</label>
        <div>
          <input autoComplete="off" defaultValue={query} id="site-search" name="q" type="search" />
          <button className="primary" type="submit">
            Search
          </button>
        </div>
      </form>
      {query.length === 1 ? <p>Enter at least two characters to search.</p> : null}
      {query.length >= 2 ? (
        <section aria-label="Search results" className="search-results">
          <h2>Results for “{query}”</h2>
          {results.length ? (
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <h3>
                    <Link href={result.href}>{result.title}</Link>
                  </h3>
                  {result.summary ? <p>{result.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </section>
      ) : null}
    </main>
  )
}
