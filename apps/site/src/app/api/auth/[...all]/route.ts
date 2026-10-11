import { identityServer } from '@/lib/identity/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
async function handle(request: Request) {
  try {
    return await (await identityServer('customer')).handler(request)
  } catch {
    return Response.json({ error: 'Identity is temporarily unavailable' }, { status: 503 })
  }
}
export const GET = handle
export const POST = handle
