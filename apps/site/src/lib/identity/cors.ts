import { getSiteURL } from '@danielmarkland/publishing-core/serverEnvironment'

// First-party web clients use explicit configured origins; never reflect arbitrary origins.
function allowed(request: Request) {
  const origin = request.headers.get('origin')
  const origins = [getSiteURL(), ...(process.env.AUTH_TRUSTED_ORIGINS || '').split(',')]
  return origin && origins.some((value) => value.trim() === origin) ? origin : undefined
}
export function identityCors(request: Request, response: Response) {
  const origin = allowed(request)
  if (!origin) return response
  const headers = new Headers(response.headers)
  headers.set('access-control-allow-origin', origin)
  headers.set('access-control-allow-credentials', 'true')
  headers.append('vary', 'Origin')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
export function identityPreflight(request: Request) {
  if (!allowed(request)) return new Response(null, { status: 403 })
  return identityCors(
    request,
    new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type, authorization, expo-origin',
        'access-control-max-age': '600',
      },
    }),
  )
}
