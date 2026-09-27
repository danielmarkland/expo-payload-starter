import type { Redirect } from '@/payload-types'

export function resolveRedirect(
  redirect: Redirect,
): { destination: string; status: 301 | 302 } | null {
  const target = redirect.to
  if (!target) return null

  let destination: string | null = null
  if (target.type === 'custom') {
    const url = target.url
    if (url?.startsWith('/') && !url.startsWith('//')) destination = url
    else if (url) {
      try {
        if (['http:', 'https:'].includes(new URL(url).protocol)) destination = url
      } catch {
        destination = null
      }
    }
  } else if (target.reference && typeof target.reference === 'object') {
    const reference = target.reference
    const value = reference.value
    if (typeof value === 'object' && value !== null && 'slug' in value) {
      const slug = value.slug
      if (typeof slug === 'string') {
        destination =
          reference.relationTo === 'posts'
            ? `/posts/${encodeURIComponent(slug)}`
            : slug === 'home'
              ? '/'
              : `/${encodeURIComponent(slug)}`
      }
    }
  }

  if (!destination) return null
  if (redirect.type === '301') return { destination, status: 301 }
  if (redirect.type === '302') return { destination, status: 302 }
  return null
}
