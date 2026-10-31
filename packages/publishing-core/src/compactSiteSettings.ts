import type { Field, RowField } from 'payload'
import { compactBlockSettings } from './compactBlockSettings.js'

const row = (fields: Field[], palette = false): RowField => ({
  type: 'row',
  admin: {
    className: `compact-settings-row${palette ? ' compact-palette-row' : ''}`,
  },
  fields: fields.map(
    (field) =>
      ({
        ...field,
        admin: { ...field.admin, width: palette ? '25%' : '50%' },
      }) as Field,
  ),
})

const halfRow = (field: Field): Field => ({
  ...row([field]),
  admin: { className: 'compact-editor-row' },
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
        for (let index = 0; index < colors.length; index += 4)
          rows.push(row(colors.slice(index, index + 4), true))
        return { ...field, fields: rows }
      }
    }
    const children = compactSiteSettings(field.fields)
    if (field.type === 'group' && 'name' in field && field.name === 'theme') {
      const typography = new Set([
        'fontPreset',
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
      const presetNames = [
        'defaultMode',
        'allowToggle',
        'densityPreset',
        'shapePreset',
      ]
      const presets = presetNames.flatMap((name) =>
        children.filter((child) => 'name' in child && child.name === name),
      )
      const remaining = children.filter(
        (child) =>
          !('name' in child) ||
          (!presetNames.includes(child.name) &&
            !typography.has(child.name) &&
            !['light', 'dark'].includes(child.name)),
      )
      return {
        ...field,
        fields: [
          ...compactBlockSettings([...presets, ...remaining], true),
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
    if (field.type === 'group' && 'name' in field && field.name === 'buttons')
      return {
        ...field,
        fields: children.map((child) =>
          'name' in child &&
          child.name === 'shape' &&
          child.admin?.width !== '50%'
            ? halfRow(child)
            : child,
        ),
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
    } else if (
      'name' in current &&
      ['favicon', 'listSurface'].includes(current.name) &&
      current.admin?.width !== '50%'
    ) {
      output.push(halfRow(current))
    } else output.push(current)
  }
  return output
}
