import { forwardToV1 } from '@/lib/api/internal'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function GET(request: Request) {
  return forwardToV1(request, '/site-config')
}
