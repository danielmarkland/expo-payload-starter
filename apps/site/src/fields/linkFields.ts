import type { Field } from 'payload'

import { buttonVariantOptions, type ButtonVariant } from '@/lib/buttonVariants'

export const linkIconOptions = [
  { label: 'Arrow right', value: 'arrow-right' },
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
] as const

export const socialIconOptions = linkIconOptions.filter(({ value }) =>
  ['github', 'linkedin', 'mail', 'twitter', 'youtube'].includes(value),
)

export function validateSafeURL(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return 'Enter a URL.'
  if (/^#[a-z][a-z0-9-]*$/.test(value) || (value.startsWith('/') && !value.startsWith('//'))) {
    return true
  }
  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(value).protocol)
      ? true
      : 'Use a relative path, https, mailto, or tel URL.'
  } catch {
    return 'Use a relative path, https, mailto, or tel URL.'
  }
}

export function validateExternalURL(value: unknown) {
  if (typeof value !== 'string') return 'Enter a valid https, mailto, or tel URL.'
  try {
    return ['https:', 'mailto:', 'tel:'].includes(new URL(value).protocol)
      ? true
      : 'Enter a valid https, mailto, or tel URL.'
  } catch {
    return 'Enter a valid https, mailto, or tel URL.'
  }
}

function isCustomURL(_data: unknown, siblingData: Record<string, unknown> | undefined) {
  return siblingData?.type === 'url'
}

export function destinationFields({
  defaultType = 'page',
  required = false,
}: { defaultType?: 'page' | 'url'; required?: boolean } = {}): Field[] {
  return [
    {
      name: 'type',
      type: 'select',
      defaultValue: defaultType,
      label: 'Destination type',
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Post', value: 'post' },
        { label: 'Custom URL', value: 'url' },
      ],
      required,
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
      label: 'Custom URL',
      admin: {
        condition: isCustomURL,
        description: 'Use a relative path, https, mailto, or tel URL.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData.type !== 'url' || !value ? true : validateSafeURL(value),
    },
    {
      name: 'newTab',
      type: 'checkbox',
      defaultValue: false,
      label: 'Open in a new tab',
      admin: { condition: isCustomURL },
    },
  ]
}

export function iconFields({ allowIconOnly = false }: { allowIconOnly?: boolean } = {}): Field[] {
  return [
    {
      name: 'icon',
      type: 'select',
      options: linkIconOptions.map((option) => ({ ...option })),
      admin: { description: 'Optional icon displayed with the link label.' },
    },
    ...(allowIconOnly
      ? [
          {
            name: 'iconOnly',
            type: 'checkbox' as const,
            defaultValue: false,
            label: 'Show only the icon',
            admin: {
              condition: (_data: unknown, siblingData: Record<string, unknown> | undefined) =>
                Boolean(siblingData?.icon),
              description: 'The label remains available to screen readers.',
            },
          },
        ]
      : [
          {
            name: 'iconPosition',
            type: 'select' as const,
            defaultValue: 'right',
            label: 'Icon position',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' },
            ],
            admin: {
              condition: (_data: unknown, siblingData: Record<string, unknown> | undefined) =>
                Boolean(siblingData?.icon),
            },
          },
        ]),
  ]
}

export function linkFields({
  allowIconOnly = false,
  defaultType = 'page',
  destinationRequired,
  includeIcon = true,
  includeLabel = true,
  required = false,
}: {
  allowIconOnly?: boolean
  defaultType?: 'page' | 'url'
  destinationRequired?: boolean
  includeIcon?: boolean
  includeLabel?: boolean
  required?: boolean
} = {}): Field[] {
  return [
    ...(includeLabel ? [{ name: 'label', type: 'text' as const, required }] : []),
    ...destinationFields({ defaultType, required: destinationRequired ?? required }),
    ...(includeIcon ? iconFields({ allowIconOnly }) : []),
  ]
}

export function actionFields(
  defaultVariant: ButtonVariant,
  { required = false }: { required?: boolean } = {},
): Field[] {
  return [
    ...linkFields({ required }),
    {
      name: 'variant',
      type: 'select',
      defaultValue: defaultVariant,
      label: 'Button style',
      options: buttonVariantOptions,
    },
  ]
}

export function submitButtonFields(defaultVariant: ButtonVariant): Field[] {
  return [
    ...iconFields(),
    {
      name: 'submitButtonVariant',
      type: 'select',
      defaultValue: defaultVariant,
      label: 'Button style',
      options: buttonVariantOptions,
    },
  ]
}

export function socialLinkFields(): Field[] {
  return [
    { name: 'label', type: 'text', required: true },
    { name: 'icon', type: 'select', options: socialIconOptions, required: true },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Use an https, mailto, or tel URL.' },
      required: true,
      validate: validateExternalURL,
    },
    { name: 'newTab', type: 'checkbox', defaultValue: true, label: 'Open in a new tab' },
  ]
}
