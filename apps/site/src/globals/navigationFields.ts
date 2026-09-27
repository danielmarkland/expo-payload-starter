import type { Field } from 'payload'

export function navigationItemsField(): Field {
  return {
    name: 'items',
    type: 'array',
    fields: [
      { name: 'label', type: 'text', required: true },
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
