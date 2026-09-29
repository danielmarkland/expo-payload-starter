import { siteConfigSchema } from '@starter/contracts'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { resolveSiteConfig } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const settings = await getSiteSettings()
  const config = siteConfigSchema.parse(resolveSiteConfig(settings))

  return Response.json(config, {
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
