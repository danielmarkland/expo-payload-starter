import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  createContactDelivery,
  createNewsletterDelivery,
} from '@danielmarkland/publishing-core/formDelivery'
import { getContactEmailConfig, getNewsletterConfig } from '@/lib/serverConfig'
export const deliverContact = createContactDelivery({
  getEmailConfig: getContactEmailConfig,
  getSendEmail: async () => {
    const payload = await getPayload({ config })
    return (email) => payload.sendEmail(email)
  },
})
export const subscribeToNewsletter = createNewsletterDelivery({
  getNewsletterConfig,
  getNewsletterGroup: async () => {
    const payload = await getPayload({ config })
    const footer = await payload.findGlobal({ slug: 'footerNavigation', depth: 0 })
    return footer.newsletter?.show ? footer.newsletter.groupId?.trim() || null : null
  },
})
