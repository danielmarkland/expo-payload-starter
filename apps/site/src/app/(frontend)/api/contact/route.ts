import { forwardToV1 } from '@/lib/api/internal'

export const runtime = 'nodejs'

export function POST(request: Request) {
  return forwardToV1(request, '/contact')
}
