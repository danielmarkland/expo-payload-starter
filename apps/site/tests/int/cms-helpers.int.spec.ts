import { describe, expect, it } from 'vitest'

import { extractSearchText } from '@/lib/extractSearchText'
import { getNavigationHref } from '@/lib/navigation'
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
})
