import { identityCors, identityPreflight } from '@/lib/identity/cors'
import { configuredIdentityProviders } from '@/lib/identity/server'
export const dynamic = 'force-dynamic'
export function GET(request: Request) {
  try {
    return identityCors(
      request,
      Response.json(configuredIdentityProviders(), {
        headers: { 'cache-control': 'no-store' },
      }),
    )
  } catch {
    return Response.json({ error: 'Identity configuration is unavailable' }, { status: 503 })
  }
}

export const OPTIONS = identityPreflight
