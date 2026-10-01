export type PublishingRedirect = {
  to?: null | {
    type?: null | string
    url?: null | string
    reference?: null | { relationTo: string; value: unknown }
  }
  type?: null | string
}

export function resolveRedirect(
  redirect: PublishingRedirect,
): { destination: string; status: 301 | 302 } | null {
  const target = redirect.to
  if (!target) return null
  let destination: string | null = null
  if (target.type === 'custom') {
    const url = target.url
    if (url?.startsWith('/') && !url.startsWith('//')) destination = url
    else if (url) {
      try {
        if (['http:', 'https:'].includes(new URL(url).protocol))
          destination = url
      } catch {
        destination = null
      }
    }
  } else if (target.reference && typeof target.reference === 'object') {
    const { relationTo, value } = target.reference
    if (
      typeof value === 'object' &&
      value !== null &&
      'slug' in value &&
      typeof value.slug === 'string'
    ) {
      destination =
        relationTo === 'posts'
          ? `/posts/${encodeURIComponent(value.slug)}`
          : value.slug === 'home'
            ? '/'
            : `/${encodeURIComponent(value.slug)}`
    }
  }
  if (!destination) return null
  if (redirect.type === '301') return { destination, status: 301 }
  if (redirect.type === '302') return { destination, status: 302 }
  return null
}
