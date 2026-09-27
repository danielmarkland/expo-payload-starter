import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { resolveRedirect } from './lib/redirects'
import type { Redirect } from './payload-types'
import payloadConfig from './payload.config'

const redirectCacheTTL = 30_000
let redirectCache: { expiresAt: number; docs: Redirect[] } | null = null

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    (request.method !== 'GET' && request.method !== 'HEAD') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.[a-zA-Z0-9]{2,8}$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const payload = await getPayload({ config: payloadConfig })
  if (!redirectCache || redirectCache.expiresAt <= Date.now()) {
    const redirects = await payload.find({
      collection: 'redirects',
      depth: 1,
      limit: 1000,
      overrideAccess: true,
    })
    redirectCache = { docs: redirects.docs, expiresAt: Date.now() + redirectCacheTTL }
  }
  const match = redirectCache.docs.find((redirect) => redirect.from === pathname)
  if (!match) return NextResponse.next()
  const redirect = resolveRedirect(match)
  if (!redirect) return NextResponse.next()
  return NextResponse.redirect(new URL(redirect.destination, request.url), redirect.status)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
