import type { Field } from 'payload'
export function newsletterDestinationField(endpoint: string): Field {
  return {
    name: 'destinationId',
    type: 'text',
    admin: {
      description:
        'Use the site default or select an enabled newsletter destination.',
      components: {
        Field: {
          path: '@danielmarkland/publishing-ui/admin/NewsletterDestinationField#NewsletterDestinationField',
          clientProps: { endpoint },
        },
      },
    },
  }
}
