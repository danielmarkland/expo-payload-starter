import type { FooterNavigation, HeaderNavigation } from '@/payload-types'

type NavigationItem =
  NonNullable<HeaderNavigation['items']>[number] | NonNullable<FooterNavigation['items']>[number]

export function getNavigationHref(item: NavigationItem): string | null {
  if (
    item.type === 'page' &&
    item.page &&
    typeof item.page === 'object' &&
    item.page._status === 'published'
  ) {
    return item.page.slug === 'home' ? '/' : `/${encodeURIComponent(item.page.slug)}`
  }

  if (
    item.type === 'post' &&
    item.post &&
    typeof item.post === 'object' &&
    item.post._status === 'published'
  ) {
    return `/posts/${encodeURIComponent(item.post.slug)}`
  }

  if (item.type !== 'url' || !item.url) return null
  if (item.url.startsWith('/') && !item.url.startsWith('//')) return item.url

  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(item.url).protocol)
      ? item.url
      : null
  } catch {
    return null
  }
}
