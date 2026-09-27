import { getPayload } from 'payload'

import config from '@/payload.config'

export async function getSiteSettings() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'siteSettings', depth: 1 })
}
