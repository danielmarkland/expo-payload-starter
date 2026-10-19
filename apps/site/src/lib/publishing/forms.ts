import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  createContactDelivery,
  createNewsletterDelivery,
  createMailerLiteNewsletter,
} from '@danielmarkland/publishing-core/formDelivery'
import { getContactEmailConfig, getNewsletterConfig } from '@/lib/serverConfig'
export const deliverContact = createContactDelivery({
  getEmailConfig: getContactEmailConfig,
  getSendEmail: async () => {
    const payload = await getPayload({ config })
    return (email) => payload.sendEmail(email)
  },
})
// Standalone deployments administer their own named destinations through environment configuration.
function newsletterDestinations() {
  const raw = process.env.NEWSLETTER_DESTINATIONS
  if (!raw) return []
  const parsed = JSON.parse(raw) as {
    id: string
    name: string
    groupId: string
    isDefault: boolean
  }[]
  if (
    !Array.isArray(parsed) ||
    parsed.length > 100 ||
    !parsed.every(
      (d) =>
        /^[a-z0-9][a-z0-9-]{0,79}$/.test(d.id) &&
        typeof d.name === 'string' &&
        /^\d{1,40}$/.test(d.groupId) &&
        typeof d.isDefault === 'boolean',
    ) ||
    new Set(parsed.map((d) => d.id)).size !== parsed.length ||
    parsed.filter((d) => d.isDefault).length > 1
  )
    throw new Error('Invalid NEWSLETTER_DESTINATIONS configuration')
  return parsed
}
export async function availableNewsletterDestinations() {
  const config = getNewsletterConfig()
  return {
    destinations:
      config.apiKey && config.turnstileSecret
        ? newsletterDestinations().map(({ id, name, isDefault }) => ({ id, name, isDefault }))
        : [],
  }
}
export const subscribeToNewsletter = createNewsletterDelivery({
  getDestination: async (id) => {
    const config = getNewsletterConfig()
    const destination = newsletterDestinations().find((d) => (id ? d.id === id : d.isDefault))
    return destination && config.apiKey && config.turnstileSecret
      ? {
          turnstileSecret: config.turnstileSecret,
          subscribe: createMailerLiteNewsletter(config.apiKey, destination.groupId),
        }
      : null
  },
})
