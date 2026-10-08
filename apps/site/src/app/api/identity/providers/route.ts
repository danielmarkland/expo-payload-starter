import { betterAuthEnabled, configuredIdentityProviders } from '@/lib/identity/server'
export const dynamic = 'force-dynamic'
export function GET() {
  if (!betterAuthEnabled()) return new Response(null, { status: 404 })
  try {
    return Response.json(configuredIdentityProviders(), {
      headers: { 'cache-control': 'no-store' },
    })
  } catch {
    return Response.json({ error: 'Identity configuration is unavailable' }, { status: 503 })
  }
}
