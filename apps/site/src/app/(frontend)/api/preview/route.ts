import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  const slug = url.searchParams.get('slug')
  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET || !slug) {
    return new Response('Invalid preview request', { status: 401 })
  }
  ;(await draftMode()).enable()
  redirect(`/posts/${encodeURIComponent(slug)}`)
}
