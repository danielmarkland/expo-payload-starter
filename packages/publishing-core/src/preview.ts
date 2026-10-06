export type PreviewCollection = 'pages' | 'posts'
export function publishingDocumentPath(
  collection: PreviewCollection,
  slug: string,
) {
  return collection === 'posts'
    ? `/posts/${encodeURIComponent(slug)}`
    : slug === 'home'
      ? '/'
      : `/${encodeURIComponent(slug)}`
}
export function createPreviewURLBuilder({
  getSecret,
  getSiteURL,
}: {
  getSecret: () => string
  getSiteURL: (data: Record<string, unknown>) => string | Promise<string>
}) {
  return (collection: PreviewCollection) =>
    async (data: Record<string, unknown>) => {
      const siteURL = await getSiteURL(data)
      return `${siteURL}/api/preview?collection=${collection}&slug=${encodeURIComponent(String(data.slug ?? ''))}&secret=${encodeURIComponent(getSecret())}`
    }
}
export function createPreviewHandler({
  getSecret,
  enableDraftMode,
  redirect,
}: {
  getSecret: () => string
  enableDraftMode: () => void | Promise<void>
  redirect: (path: string) => never
}) {
  return async (request: Request) => {
    const params = new URL(request.url).searchParams
    const collection = params.get('collection') || 'posts'
    const secret = params.get('secret'),
      slug = params.get('slug')
    const expected = getSecret()
    if (
      !expected ||
      secret !== expected ||
      !slug ||
      (collection !== 'pages' && collection !== 'posts')
    )
      return new Response('Invalid preview request', { status: 401 })
    await enableDraftMode()
    return redirect(publishingDocumentPath(collection, slug))
  }
}
