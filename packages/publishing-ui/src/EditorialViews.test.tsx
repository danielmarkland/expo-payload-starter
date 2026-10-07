import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) =>
    createElement('a', props, children),
}))
vi.mock('next/image', () => ({
  default: ({
    unoptimized: _,
    ...props
  }: ComponentProps<'img'> & { unoptimized?: boolean }) =>
    createElement('img', props),
}))
import { EditorialArchive } from './EditorialArchive.js'
import { SearchPage } from './SearchPage.js'
import { Article } from './Article.js'
import { archivePresentationSchema } from '@danielmarkland/publishing-contracts'
import type { ApiPost } from '@danielmarkland/publishing-contracts'
afterEach(cleanup)
it('keeps article headings, taxonomy, and dates in the shared view', () => {
  const post = {
    id: 1,
    slug: 'record',
    title: 'A record',
    summary: 'Review',
    body: null,
    publishedAt: '2026-01-01T12:00:00Z',
    author: { id: 2, slug: 'dan', name: 'Dan' },
    categories: [{ id: 3, slug: 'jazz', title: 'Jazz' }],
    tags: [],
    showTableOfContents: false,
  } as unknown as ApiPost
  render(<Article post={post} />)
  expect(
    screen.getByRole('heading', { level: 1, name: 'A record' }),
  ).toBeDefined()
  expect(screen.getByRole('link', { name: 'Dan' }).getAttribute('href')).toBe(
    '/authors/dan',
  )
  expect(screen.getByRole('link', { name: 'Jazz' }).getAttribute('href')).toBe(
    '/categories/jazz',
  )
  expect(document.querySelector('time')?.getAttribute('dateTime')).toBe(
    post.publishedAt,
  )
})
it('renders author profile and rejects unsafe profile destinations', () => {
  render(
    <EditorialArchive
      eyebrow="Author"
      title="Dan"
      description="Profile"
      website="javascript:alert(1)"
      posts={[]}
    />,
  )
  expect(screen.getByRole('heading', { level: 1, name: 'Dan' })).toBeDefined()
  expect(screen.queryByText('Author website')).toBeNull()
})
it('keeps the search form labeled and renders the minimum-query guidance', () => {
  render(<SearchPage query="a" results={[]} />)
  expect(
    screen.getByRole('searchbox', { name: 'Search pages and posts' }),
  ).toBeDefined()
  expect(
    screen.getByText('Enter at least two characters to search.'),
  ).toBeDefined()
})
it('renders encoded results supplied by the routing adapter', () => {
  render(
    <SearchPage
      query="jazz"
      results={[
        { id: 1, href: '/posts/jazz', title: 'Jazz', summary: 'A review' },
      ]}
    />,
  )
  expect(screen.getByRole('link', { name: 'Jazz' }).getAttribute('href')).toBe(
    '/posts/jazz',
  )
})

it('preserves configured archive surfaces and pagination', () => {
  render(
    <EditorialArchive
      eyebrow="Category"
      title="Jazz"
      posts={[]}
      settings={archivePresentationSchema.parse({ titleSurface: 'dark' })}
      pagination={{
        page: 1,
        prevPage: null,
        nextPage: 2,
        totalPages: 2,
        hasPrevPage: false,
        hasNextPage: true,
      }}
    />,
  )
  expect(
    document.querySelector('.archive-title-surface.background-dark'),
  ).not.toBeNull()
  expect(screen.getByRole('link', { name: 'Next' }).getAttribute('href')).toBe(
    '?page=2',
  )
})
