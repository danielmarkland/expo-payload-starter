import Link from 'next/link'
import type { ReactNode } from 'react'
import type {
  ArchivePresentation,
  PostCard,
} from '@danielmarkland/publishing-contracts'
import { PostList } from './PostList.js'
export function PostArchive({
  header,
  posts,
  settings,
  pagination,
}: {
  header: ReactNode
  posts: readonly PostCard[]
  settings: ArchivePresentation
  pagination: {
    page: number
    prevPage: number | null
    nextPage: number | null
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
  }
}) {
  return (
    <main className="archive-shell">
      <div
        className={`archive-title-surface background-${settings.titleSurface} heading-alignment-${settings.titleAlignment}`}
      >
        <header className="page-title">{header}</header>
      </div>
      <section
        className={`archive-list-surface background-${settings.listSurface}`}
        aria-label="Posts"
      >
        <PostList posts={posts} {...settings} />
        {pagination.totalPages > 1 ? (
          <nav className="archive-pagination" aria-label="Pagination">
            {pagination.hasPrevPage && pagination.prevPage ? (
              <Link
                href={
                  pagination.prevPage === 1
                    ? '?'
                    : `?page=${pagination.prevPage}`
                }
                rel="prev"
              >
                Previous
              </Link>
            ) : null}
            <span aria-current="page">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.hasNextPage && pagination.nextPage ? (
              <Link href={`?page=${pagination.nextPage}`} rel="next">
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </main>
  )
}
