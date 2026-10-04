import type { ApiLink } from '@danielmarkland/publishing-contracts'

export type LinkData = ApiLink

export function getSafeExternalHref(value?: null | string): string | null {
  if (!value) return null
  if (/^#[a-z][a-z0-9-]*$/.test(value)) return value
  if (value.startsWith('/') && !value.startsWith('//')) return value

  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(
      new URL(value).protocol,
    )
      ? value
      : null
  } catch {
    return null
  }
}

export function getNavigationHref(item: LinkData): string | null {
  if (
    item.type === 'page' &&
    item.page &&
    typeof item.page === 'object' &&
    item.page._status === 'published' &&
    item.page.slug
  ) {
    return item.page.slug === 'home'
      ? '/'
      : `/${encodeURIComponent(item.page.slug)}`
  }

  if (
    item.type === 'post' &&
    item.post &&
    typeof item.post === 'object' &&
    item.post._status === 'published' &&
    item.post.slug
  ) {
    return `/posts/${encodeURIComponent(item.post.slug)}`
  }

  if (item.type && item.type !== 'url') return null
  return getSafeExternalHref(item.url)
}
