'use client'
import { createNewsletterForm } from '@danielmarkland/publishing-ui/NewsletterForm'
import { LinkLabel } from '@/components/LinkAction'
async function newsletterRequest(path: string, body?: Record<string, unknown>) {
  const response = await fetch(
    `/api/v1/newsletter${path}`,
    body
      ? {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      : undefined,
  )
  if (!response.ok) throw new Error('Newsletter request failed')
  return response.json()
}
export const NewsletterForm = createNewsletterForm({
  LinkLabel,
  getDestinations: () => newsletterRequest('/destinations'),
  subscribe: (submission) => newsletterRequest('', submission),
})
