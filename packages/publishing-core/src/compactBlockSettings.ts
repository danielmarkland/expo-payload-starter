import type { Field } from 'payload'
import { compactLinkSettings } from './compactLinkSettings.js'

const compact = (field: Field) =>
  field.type === 'number' ||
  field.type === 'checkbox' ||
  (field.type === 'select' && !field.hasMany && field.name !== 'width')

/** Unnamed native rows change layout only, never stored paths or field behavior. */
export function compactBlockSettings(
  fields: Field[],
  insideBlock = false,
): Field[] {
  const nested = fields.flatMap((field): Field[] => {
    if (field.type === 'blocks')
      return [
        {
          ...field,
          admin: {
            ...field.admin,
            className: [field.admin?.className, 'compact-block-settings']
              .filter(Boolean)
              .join(' '),
          },
          blocks: field.blocks.map((block) =>
            typeof block === 'string'
              ? block
              : { ...block, fields: compactBlockSettings(block.fields, true) },
          ),
        },
      ]
    if (field.type === 'tabs')
      return [
        {
          ...field,
          tabs: field.tabs.map((tab) => ({
            ...tab,
            fields: compactBlockSettings(tab.fields, insideBlock),
          })),
        },
      ]
    const settings =
      insideBlock || ('name' in field && field.name === 'appearance')
    if (field.type === 'row') {
      if (
        field.admin?.className === 'compact-link-row' &&
        Object.keys(field.admin ?? {}).every((key) => key === 'className')
      ) {
        const links = compactLinkSettings(field.fields)
        if (links) return links
      }
      // Existing simple setting rows use the same responsive policy.
      if (
        settings &&
        Object.keys(field.admin ?? {}).every((key) => key === 'className') &&
        (!field.admin?.className ||
          field.admin.className === 'compact-settings-row') &&
        field.fields.every(compact)
      )
        return field.fields
      return [
        {
          ...field,
          fields: compactBlockSettings(field.fields, false),
        },
      ]
    }
    if ('fields' in field)
      return [
        {
          ...field,
          admin:
            field.type === 'collapsible' && settings
              ? {
                  ...field.admin,
                  className: [
                    field.admin?.className,
                    'compact-appearance-panel',
                  ]
                    .filter(Boolean)
                    .join(' '),
                }
              : field.admin,
          fields:
            compactLinkSettings(field.fields) ||
            compactBlockSettings(field.fields, settings),
        } as Field,
      ]
    return [field]
  })
  if (!insideBlock) return nested
  const output: Field[] = []
  let pending: Field[] = []
  function flush() {
    while (pending.length) {
      const numeric = pending[0]!.type === 'number'
      let count = 0
      while (
        count < pending.length &&
        (pending[count]!.type === 'number') === numeric
      )
        count++
      const size = numeric && count >= 3 ? 3 : Math.min(2, count)
      const row = pending.splice(0, size)
      output.push({
        type: 'row',
        admin: {
          className: `compact-settings-row${size === 3 ? ' compact-settings-row--numbers' : ''}`,
        },
        fields: row.map(
          (field) =>
            ({
              ...field,
              admin: {
                ...field.admin,
                width: `${size === 1 ? 50 : 100 / size}%`,
              },
            }) as Field,
        ),
      })
    }
  }
  for (const field of nested) {
    if (compact(field)) pending.push(field)
    else {
      flush()
      output.push(field)
    }
  }
  flush()
  return output
}
