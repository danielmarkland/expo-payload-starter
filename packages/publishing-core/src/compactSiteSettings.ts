import type { Field } from 'payload'
import { compactBlockSettings } from './compactBlockSettings.js'

const row = (fields: Field[], palette = false): Field => ({
  type: 'row',
  admin: {
    className: `compact-settings-row${palette ? ' compact-palette-row' : ''}`,
  },
  fields: fields.map(
    (field) => ({ ...field, admin: { ...field.admin, width: '50%' } }) as Field,
  ),
})

/** Layout-only policy for the shared settings schema, including standalone globals. */
export function compactSiteSettings(fields: Field[]): Field[] {
  const nested = fields.map((field): Field => {
    if (field.type === 'tabs')
      return {
        ...field,
        tabs: field.tabs.map((tab) => ({
          ...tab,
          fields: compactSiteSettings(tab.fields),
        })),
      }
    if (!('fields' in field)) return field
    if (
      field.type === 'group' &&
      'name' in field &&
      ['light', 'dark'].includes(field.name)
    ) {
      const colors = field.fields.flatMap((child) =>
        child.type === 'row' && !child.admin ? child.fields : [child],
      )
      if (
        colors.every(
          (child) => child.type === 'text' && child.admin?.components?.Field,
        )
      ) {
        const rows: Field[] = []
        for (let index = 0; index < colors.length; index += 2)
          rows.push(row(colors.slice(index, index + 2), true))
        return { ...field, fields: rows }
      }
    }
    const children = compactSiteSettings(field.fields)
    if (field.type === 'group' && 'name' in field && field.name === 'theme') {
      const typography = new Set([
        'headingFont',
        'bodyFont',
        'labelFont',
        'headingWeight',
        'typographyPreset',
      ])
      const details = children.filter(
        (child) => 'name' in child && typography.has(child.name),
      )
      const palettes = children.filter(
        (child) => 'name' in child && ['light', 'dark'].includes(child.name),
      )
      return {
        ...field,
        fields: [
          ...compactBlockSettings(
            children.filter(
              (child) =>
                !('name' in child) ||
                (!typography.has(child.name) &&
                  !['light', 'dark'].includes(child.name)),
            ),
            true,
          ),
          ...(details.length
            ? [
                {
                  type: 'collapsible' as const,
                  label: 'Typography',
                  admin: { initCollapsed: true },
                  fields: compactBlockSettings(details, true),
                },
              ]
            : []),
          ...(palettes.length
            ? [
                {
                  type: 'collapsible' as const,
                  label: 'Palettes',
                  admin: { initCollapsed: true },
                  fields: palettes,
                },
              ]
            : []),
        ],
      }
    }
    return { ...field, fields: children } as Field
  })
  const output: Field[] = []
  for (let index = 0; index < nested.length; index++) {
    const current = nested[index]!,
      next = nested[index + 1]
    if (
      'name' in current &&
      next &&
      'name' in next &&
      ((current.name === 'lightLogo' && next.name === 'darkLogo') ||
        (current.name === 'logoMaxWidth' && next.name === 'logoMaxHeight'))
    ) {
      output.push(row([current, next]))
      index++
    } else output.push(current)
  }
  return output
}
