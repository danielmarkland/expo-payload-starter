import type { GlobalConfig } from 'payload'

import { footerSocialIconOptions, navigationItemsField } from './navigationFields'

function validateSocialURL(value: unknown) {
  if (typeof value !== 'string') return 'Enter a valid https, mailto, or tel URL.'
  try {
    return ['https:', 'mailto:', 'tel:'].includes(new URL(value).protocol)
      ? true
      : 'Enter a valid https, mailto, or tel URL.'
  } catch {
    return 'Enter a valid https, mailto, or tel URL.'
  }
}

export const FooterNavigation: GlobalConfig = {
  slug: 'footerNavigation',
  label: 'Footer navigation',
  dbName: 'cms_footer_navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'tagline',
      type: 'textarea',
      admin: {
        description: 'Short brand message. The site SEO description is used when this is empty.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'icon', type: 'select', options: footerSocialIconOptions, required: true },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Use an https, mailto, or tel URL.' },
          required: true,
          validate: validateSocialURL,
        },
        { name: 'newTab', type: 'checkbox', defaultValue: true },
      ],
    },
    navigationItemsField({ label: 'Legal and utility links' }),
    {
      name: 'latestPosts',
      type: 'group',
      fields: [
        {
          name: 'show',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show latest posts',
          required: true,
        },
        {
          name: 'heading',
          type: 'text',
          admin: { condition: (_data, siblingData) => siblingData?.show !== false },
          defaultValue: 'Latest posts',
          required: true,
        },
      ],
    },
    {
      name: 'copyrightOwner',
      type: 'text',
      admin: { description: 'The site title is used when this is empty.' },
    },
  ],
}
