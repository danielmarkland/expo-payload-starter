import Link from 'next/link'
export type SearchResult = {
  href: string
  id: number | string
  summary: string
  title: string
}
export function SearchPage({
  query,
  results,
}: {
  query: string
  results: readonly SearchResult[]
}) {
  return (
    <main className="archive-shell">
      <header className="page-title">
        <p className="eyebrow">Site search</p>
        <h1>Search</h1>
      </header>
      <form action="/search" className="search-form" role="search">
        <label htmlFor="site-search">Search pages and posts</label>
        <div>
          <input
            autoComplete="off"
            defaultValue={query}
            id="site-search"
            name="q"
            type="search"
          />
          <button className="button button-primary-filled" type="submit">
            Search
          </button>
        </div>
      </form>
      {query.length === 1 ? (
        <p>Enter at least two characters to search.</p>
      ) : null}
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
