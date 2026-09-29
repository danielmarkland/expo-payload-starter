import { getPayload } from 'payload'

import config from '@/payload.config'

const payload = await getPayload({ config })
const current = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })

await payload.updateGlobal({
  slug: 'siteSettings',
  data: {
    integrations: {
      googleTagManagerId:
        process.env.SETUP_GTM_CONTAINER_ID || current.integrations?.googleTagManagerId || null,
      turnstileSiteKey:
        process.env.SETUP_TURNSTILE_SITE_KEY || current.integrations?.turnstileSiteKey || null,
    },
    links: {
      appUrl: process.env.SETUP_APP_URL || current.links?.appUrl || null,
    },
  },
})

await payload.destroy()
