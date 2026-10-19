import { getPayload } from 'payload'

import config from '@/payload.config'

const payload = await getPayload({ config })
const current = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })
const currentFooter = await payload.findGlobal({ slug: 'footerNavigation', depth: 0 })

await payload.updateGlobal({
  slug: 'siteSettings',
  data: {
    integrations: {
      googleTagManagerId:
        process.env.SETUP_GTM_CONTAINER_ID || current.integrations?.googleTagManagerId || null,
      turnstileSiteKey:
        process.env.SETUP_TURNSTILE_SITE_KEY || current.integrations?.turnstileSiteKey || null,
    },
  },
})

if (process.env.SETUP_NEWSLETTER_DESTINATION_ID) {
  await payload.updateGlobal({
    slug: 'footerNavigation',
    data: {
      newsletter: {
        ...currentFooter.newsletter,
        destinationId: process.env.SETUP_NEWSLETTER_DESTINATION_ID,
      },
    },
  })
}

await payload.destroy()
