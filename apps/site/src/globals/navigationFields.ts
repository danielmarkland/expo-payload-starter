import type { Field } from 'payload'

export function navigationItemsField({
  includeIcons = false,
}: { includeIcons?: boolean } = {}): Field {
  return {
    name: 'items',
    type: 'array',
    fields: [
      { name: 'label', type: 'text', required: true },
      ...(includeIcons
        ? [
            {
              name: 'icon',
              type: 'select' as const,
              options: [
                { label: 'Book', value: 'book-open' },
                { label: 'External link', value: 'external-link' },
                { label: 'GitHub', value: 'github' },
                { label: 'Home', value: 'home' },
                { label: 'Info', value: 'info' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Email', value: 'mail' },
                { label: 'Search', value: 'search' },
                { label: 'Shop', value: 'shopping-bag' },
                { label: 'Account', value: 'user' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'X / Twitter', value: 'twitter' },
              ],
              admin: { description: 'Optional Lucide icon displayed alongside the link label.' },
            },
            {
              name: 'iconOnly',
              type: 'checkbox' as const,
              defaultValue: false,
              admin: {
                condition: (_data: unknown, siblingData: unknown) =>
                  Boolean((siblingData as { icon?: string | null }).icon),
                description:
                  'Hide the visible label. The link label remains available to screen readers.',
              },
            },
          ]
        : []),
      {
        name: 'type',
        type: 'select',
        defaultValue: 'page',
        options: [
          { label: 'Page', value: 'page' },
          { label: 'Post', value: 'post' },
          { label: 'Custom URL', value: 'url' },
        ],
        required: true,
      },
      {
        name: 'page',
        type: 'relationship',
        relationTo: 'pages',
        admin: { condition: (_, siblingData) => siblingData?.type === 'page' },
      },
      {
        name: 'post',
        type: 'relationship',
        relationTo: 'posts',
        admin: { condition: (_, siblingData) => siblingData?.type === 'post' },
      },
      {
        name: 'url',
        type: 'text',
        admin: { condition: (_, siblingData) => siblingData?.type === 'url' },
      },
      {
        name: 'newTab',
        type: 'checkbox',
        defaultValue: false,
        admin: { condition: (_, siblingData) => siblingData?.type === 'url' },
      },
    ],
  }
}
