import { apiApp } from '@/lib/api/app'

export function internalApiRequest(path: string, init?: RequestInit) {
  return apiApp.request(`http://internal/api/v1${path}`, init)
}

export async function forwardToV1(request: Request, path: string) {
  const headers = new Headers(request.headers)
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()
  const response = await internalApiRequest(path, {
    body,
    headers,
    method: request.method,
  })
  let forwarded: Response
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string } | string
    } | null
    const message =
      typeof body?.error === 'string'
        ? body.error
        : body?.error?.message || 'The request could not be completed.'
    forwarded = Response.json({ error: message }, { status: response.status })
  } else {
    forwarded = new Response(response.body, response)
  }
  forwarded.headers.set('deprecation', 'true')
  forwarded.headers.set('link', `</api/v1${path}>; rel="successor-version"`)
  return forwarded
}
