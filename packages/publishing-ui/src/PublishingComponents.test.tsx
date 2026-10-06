import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { postCardSchema } from '@danielmarkland/publishing-contracts'

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
import { LatestPostsSection } from './LatestPostsSection.js'
import { SiteBrand } from './SiteBrand.js'
import { SiteHeader } from './SiteHeader.js'

const post = postCardSchema.parse({
  id: 'post-1',
  slug: 'news/one',
  title: 'A post',
  summary: 'A summary',
  publishedAt: '2026-01-01T12:00:00Z',
  meta: { image: { id: 1, alt: 'Cover', url: '/cover.jpg' } },
})
afterEach(cleanup)

describe('publishing presentation', () => {
  it('renders validated card content and encodes its link', () => {
    render(<PostList posts={[post]} />)
    expect(
      screen.getAllByRole('link', { name: 'A post' })[0].getAttribute('href'),
    ).toBe('/posts/news%2Fone')
    expect(screen.getByRole('img', { name: 'Cover' }).getAttribute('src')).toBe(
      '/cover.jpg',
    )
    expect(screen.getByText('January 1, 2026').getAttribute('dateTime')).toBe(
      post.publishedAt,
    )
  })
  it('handles empty sections and unresolved media', () => {
    const { rerender } = render(<LatestPostsSection posts={[]} />)
    expect(screen.queryByRole('region')).toBeNull()
    rerender(<PostList posts={[]} />)
    expect(screen.getByText('No published posts yet.')).toBeDefined()
    rerender(
      <LatestPostsSection
        posts={[{ ...post, meta: { image: 42 } }]}
        heading="News"
        eyebrow="Updates"
      />,
    )
    expect(screen.getByRole('region', { name: 'News' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('A post')
    expect(screen.queryByRole('img')).toBeNull()
  })
  it('renders only the supplied brand', () => {
    const config = {
      identity: { siteTitle: 'Example', darkLogoUrl: null, lightLogoUrl: null },
    }
    // SiteBrand only needs identity; its public input type describes that surface.
    render(<SiteBrand siteConfig={config} />)
    expect(
      screen.getByRole('link', { name: 'Example' }).getAttribute('href'),
    ).toBe('/')
    expect(screen.getAllByText('Example')).toHaveLength(2)
  })
  it('renders supplied header navigation and sticky branding without a disabled theme toggle', () => {
    render(
      <SiteHeader
        siteConfig={{
          identity: {
            siteTitle: 'Example',
            darkLogoUrl: null,
            lightLogoUrl: null,
          },
          theme: { allowToggle: false, defaultMode: 'system' },
        }}
        navigation={<a href="/about">About</a>}
        search={<a href="/search">Search</a>}
        sticky
        themeStorageKey="example-theme"
      />,
    )
    expect(screen.getByRole('banner').className).toContain('site-header-sticky')
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeDefined()
    expect(
      screen.getByRole('link', { name: 'About' }).getAttribute('href'),
    ).toBe('/about')
    expect(
      screen.getByRole('link', { name: 'Search' }).getAttribute('href'),
    ).toBe('/search')
    expect(screen.queryByRole('button')).toBeNull()
  })
})
