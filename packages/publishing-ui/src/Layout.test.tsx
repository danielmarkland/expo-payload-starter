import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { archivePresentationSchema } from '@danielmarkland/publishing-contracts'
vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) =>
    createElement('a', props, children),
}))
vi.mock('next/image', () => ({
  default: ({
    unoptimized: _unoptimized,
    ...props
  }: ComponentProps<'img'> & { unoptimized?: boolean }) =>
    createElement('img', props),
}))
import { PostList } from './PostList.js'
import { PostArchive } from './PostArchive.js'
const post = {
  id: 1,
  slug: 'mix',
  title: 'Mix',
  summary: 'Music',
  meta: { image: { id: 1, url: '/cover.png', alt: 'Cover' } },
}
afterEach(cleanup)
describe('artwork and archive layouts', () => {
  it('renders accessible linked artwork without visible card copy', () => {
    const { container } = render(
      <PostList
        posts={[post]}
        imageProportion="square"
        presentation="imageOnly"
        columns="3"
      />,
    )
    expect(screen.getByRole('link', { name: 'Mix' }).getAttribute('href')).toBe(
      '/posts/mix',
    )
    expect(screen.queryByRole('heading')).toBeNull()
    expect(
      container.querySelector('.image-proportion-square.columns-3'),
    ).not.toBeNull()
  })
  it('retains a title when artwork is missing', () => {
    render(
      <PostList posts={[{ ...post, meta: null }]} presentation="imageOnly" />,
    )
    expect(screen.getByRole('heading', { name: 'Mix' })).toBeDefined()
  })
  it('renders pagination and independent title/list surfaces', () => {
    render(
      <PostArchive
        posts={[post]}
        header={<h1>Mixtapes</h1>}
        settings={archivePresentationSchema.parse({
          titleSurface: 'dark',
          listSurface: 'light',
        })}
        pagination={{
          page: 2,
          prevPage: 1,
          nextPage: 3,
          totalPages: 3,
          hasPrevPage: true,
          hasNextPage: true,
        }}
      />,
    )
    expect(
      screen.getByRole('link', { name: 'Previous' }).getAttribute('href'),
    ).toBe('?')
    expect(
      screen.getByRole('link', { name: 'Next' }).getAttribute('href'),
    ).toBe('?page=3')
    expect(screen.getByText('Page 2 of 3')).toBeDefined()
  })
  it('omits navigation for a single page', () => {
    render(
      <PostArchive
        posts={[]}
        header={<h1>Mixtapes</h1>}
        settings={archivePresentationSchema.parse({})}
        pagination={{
          page: 1,
          prevPage: null,
          nextPage: null,
          totalPages: 0,
          hasPrevPage: false,
          hasNextPage: false,
        }}
      />,
    )
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})
