import { describe, expect, it } from 'vitest'

import { extractSearchText } from '@/lib/extractSearchText'
import { getNavigationHref, getSafeExternalHref } from '@/lib/navigation'
import { extractPostHeadings } from '@/lib/postHeadings'
import {
  getHeaderNavigationPresentation,
  getSearchNavigationPresentation,
} from '@/lib/headerNavigationIcons'
import { resolveRedirect } from '@/lib/redirects'
import type { Redirect } from '@/payload-types'

describe('CMS helpers', () => {
  it('extracts readable text from rich text and blocks without structural labels', () => {
    const result = extractSearchText({
      body: { root: { children: [{ type: 'text', text: 'Hello search' }] } },
      id: 42,
      summary: 'A quick summary',
      title: 'Example post',
    })
    expect(result).toContain('A quick summary')
    expect(result).toContain('Hello search')
    expect(result).toContain('Example post')
  })

  it('builds only published navigation destinations and rejects unsafe custom URLs', () => {
    expect(
      getNavigationHref({
        id: 'home-link',
        label: 'Home',
        type: 'page',
        page: { id: 1, slug: 'home', title: 'Home', _status: 'published' },
      } as never),
    ).toBe('/')
    expect(
      getNavigationHref({
        id: 'draft-link',
        label: 'Draft',
        type: 'page',
        page: { id: 2, slug: 'draft', title: 'Draft', _status: 'draft' },
      } as never),
    ).toBeNull()
    expect(
      getNavigationHref({
        id: 'unsafe',
        label: 'Unsafe',
        type: 'url',
        url: 'javascript:alert(1)',
      } as never),
    ).toBeNull()
  })

  it('accepts supported footer destinations and rejects unsafe protocols', () => {
    expect(getSafeExternalHref('https://example.com/profile')).toBe('https://example.com/profile')
    expect(getSafeExternalHref('mailto:hello@example.com')).toBe('mailto:hello@example.com')
    expect(getSafeExternalHref('#contact')).toBe('#contact')
    expect(getSafeExternalHref('javascript:alert(1)')).toBeNull()
    expect(getSafeExternalHref('//example.com')).toBeNull()
  })

  it('keeps URL-only records working during the destination migration', () => {
    expect(getNavigationHref({ url: '/legacy-link' })).toBe('/legacy-link')
  })

  it('renders curated header icons and only hides labels when an icon is available', () => {
    const iconOnly = getHeaderNavigationPresentation({ icon: 'github', iconOnly: true } as never)
    expect(iconOnly.Icon).toBeDefined()
    expect(iconOnly.iconOnly).toBe(true)

    expect(
      getHeaderNavigationPresentation({ icon: 'not-a-supported-icon', iconOnly: true } as never),
    ).toEqual({ Icon: undefined, iconOnly: false })
  })

  it('configures the built-in Search link with safe icon fallback', () => {
    expect(getSearchNavigationPresentation({ showSearch: false })).toEqual({
      Icon: undefined,
      show: false,
    })
    expect(
      getSearchNavigationPresentation({ searchIcon: 'search', showSearch: true }).Icon,
    ).toBeDefined()
    expect(
      getSearchNavigationPresentation({
        searchIcon: 'not-a-supported-icon',
        showSearch: true,
      } as never),
    ).toEqual({ Icon: undefined, show: true })
  })

  it('resolves CMS redirects with exact status codes and safe destinations', () => {
    const postRedirect = {
      id: 1,
      from: '/old-post',
      to: {
        type: 'reference',
        reference: { relationTo: 'posts', value: { id: 10, slug: 'new-post' } },
      },
      type: '301',
      createdAt: '',
      updatedAt: '',
    } as unknown as Redirect

    expect(resolveRedirect(postRedirect)).toEqual({ destination: '/posts/new-post', status: 301 })
    expect(
      resolveRedirect({ ...postRedirect, to: { type: 'custom', url: '//bad.example' } }),
    ).toBeNull()
  })

  it('extracts stable, unique table-of-contents anchors from level-two and level-three headings', () => {
    expect(
      extractPostHeadings({
        root: {
          children: [
            { children: [{ text: 'Introduction', type: 'text' }], tag: 'h2', type: 'heading' },
            { children: [{ text: 'Details', type: 'text' }], tag: 'h3', type: 'heading' },
            { children: [{ text: 'Introduction', type: 'text' }], tag: 'h2', type: 'heading' },
            { children: [{ text: 'Ignored', type: 'text' }], tag: 'h4', type: 'heading' },
          ],
        },
      }),
    ).toEqual([
      { id: 'introduction', level: 2, text: 'Introduction' },
      { id: 'details', level: 3, text: 'Details' },
      { id: 'introduction-2', level: 2, text: 'Introduction' },
    ])
  })
})
