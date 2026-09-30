import type { Field } from 'payload'

import { linkFields, linkIconOptions } from '@/fields/linkFields'

export const headerNavigationIconOptions = linkIconOptions.map((option) => ({ ...option }))

export function navigationItemsField({
  includeIcons = false,
  label,
}: { includeIcons?: boolean; label?: string } = {}): Field {
  return {
    name: 'items',
    type: 'array',
    label,
    fields: linkFields({ allowIconOnly: includeIcons, includeIcon: includeIcons, required: true }),
  }
}
