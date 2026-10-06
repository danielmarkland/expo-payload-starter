import type { Metadata } from 'next'
import { SearchPage as SearchView } from '@danielmarkland/publishing-ui/SearchPage'
import { getSearchResults } from '@/lib/api/content'

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
  const results: { href: string; id: number | string; summary: string; title: string }[] = []

  if (query.length >= 2) {
    results.push(...(await getSearchResults(query)))
  }

  return <SearchView query={query} results={results} />
}
