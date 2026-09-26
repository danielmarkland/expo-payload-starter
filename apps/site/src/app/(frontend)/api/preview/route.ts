import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const collection = url.searchParams.get('collection') || 'posts'
  const secret = url.searchParams.get('secret')
  const slug = url.searchParams.get('slug')
  if (
    !process.env.PREVIEW_SECRET ||
    secret !== process.env.PREVIEW_SECRET ||
    !slug ||
    !['pages', 'posts'].includes(collection)
  ) {
    return new Response('Invalid preview request', { status: 401 })
  }
  ;(await draftMode()).enable()
  const path =
    collection === 'posts'
      ? `/posts/${encodeURIComponent(slug)}`
      : slug === 'home'
        ? '/'
        : `/${encodeURIComponent(slug)}`
  redirect(path)
}
