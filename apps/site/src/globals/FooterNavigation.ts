import type { GlobalConfig } from 'payload'

import { appearanceField } from '@/blocks'
import { linkArrayPresentation, socialLinkFields, submitButtonFields } from '@/fields/linkFields'
import { navigationItemsField } from './navigationFields'

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
      type: 'collapsible',
      label: 'Newsletter CTA',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'newsletter',
          type: 'group',
          label: false,
          fields: [
            {
              name: 'show',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show newsletter signup on every page',
              required: true,
            },
            { name: 'eyebrow', type: 'text', defaultValue: 'Newsletter' },
            { name: 'heading', type: 'text', defaultValue: 'Stay in the loop', required: true },
            {
              name: 'body',
              type: 'textarea',
              defaultValue: 'Get occasional updates delivered to your inbox.',
            },
            {
              name: 'groupId',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.show === true,
                description: 'MailerLite group ID. The API key remains server-side.',
              },
              validate: (
                value: null | string | undefined,
                { siblingData }: { siblingData: { show?: boolean } },
              ) =>
                siblingData?.show !== true || (typeof value === 'string' && value.trim())
                  ? true
                  : 'A MailerLite group ID is required when newsletter signup is enabled.',
            },
            { name: 'submitLabel', type: 'text', defaultValue: 'Subscribe', required: true },
            ...submitButtonFields('primary-filled'),
            {
              name: 'successMessage',
              type: 'text',
              defaultValue: 'Thanks for subscribing.',
              required: true,
            },
            {
              name: 'consentText',
              type: 'textarea',
              defaultValue:
                'By subscribing, you agree to receive email updates. Unsubscribe anytime.',
            },
            appearanceField(),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact form',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'contactForm',
          type: 'group',
          label: false,
          fields: [
            {
              name: 'show',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show contact form on every page',
              required: true,
            },
            { name: 'eyebrow', type: 'text', defaultValue: 'Contact' },
            { name: 'heading', type: 'text', defaultValue: 'How can I help?', required: true },
            { name: 'body', type: 'textarea' },
            { name: 'submitLabel', type: 'text', defaultValue: 'Send message', required: true },
            ...submitButtonFields('primary-filled'),
            {
              name: 'successMessage',
              type: 'text',
              defaultValue: 'Thanks. Your message has been sent.',
              required: true,
            },
            appearanceField(),
          ],
        },
      ],
    },
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
      ...linkArrayPresentation,
      fields: socialLinkFields(),
    },
    navigationItemsField({ includeIcons: true, label: 'Legal and utility links' }),
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
