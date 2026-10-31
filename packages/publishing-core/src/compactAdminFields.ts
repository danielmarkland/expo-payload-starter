import type { Field } from 'payload'
import { compactSEOFields } from './payloadSEO.js'

const shortTypes = new Set([
  'text',
  'email',
  'number',
  'date',
  'select',
  'relationship',
  'checkbox',
  'radio',
  'password',
])

function ordinaryField(field: Field): boolean {
  const component = field.admin?.components?.Field
  const path =
    typeof component === 'string'
      ? component
      : component && 'path' in component
        ? component.path
        : undefined
  const compactPicker =
    typeof path === 'string' &&
    /\/(IconPickerField|ColorPickerField)#\1$/.test(path)
  return (
    (shortTypes.has(field.type) ||
      ['textarea', 'upload'].includes(field.type)) &&
    !('hidden' in field && field.hidden) &&
    !(field.admin && 'hidden' in field.admin && field.admin.hidden) &&
    (!component || compactPicker) &&
    !field.admin?.position &&
    !field.admin?.width
  )
}

function shortField(field: Field): boolean {
  return (
    ordinaryField(field) &&
    shortTypes.has(field.type) &&
    !('hasMany' in field && field.hasMany) &&
    !field.admin?.condition
  )
}

const row = (fields: Field[]): Field => ({
  type: 'row',
  admin: { className: 'compact-editor-row' },
  fields: fields.map(
    (field) => ({ ...field, admin: { ...field.admin, width: '50%' } }) as Field,
  ),
})

/** Ordinary controls are half-width even without a compatible adjacent control. */
export function compactAdminFields(fields: Field[], pair = true): Field[] {
  const nested = fields.map((field): Field => {
    if (field.type === 'blocks')
      return {
        ...field,
        blocks: field.blocks.map((block) =>
          typeof block === 'string'
            ? block
            : {
                ...block,
                fields: compactAdminFields(block.fields),
              },
        ),
      }
    if (field.type === 'tabs')
      return {
        ...field,
        tabs: field.tabs.map((tab) => ({
          ...tab,
          fields: compactAdminFields(tab.fields),
        })),
      }
    if ('fields' in field) {
      const children = compactAdminFields(field.fields, field.type !== 'row')
      return {
        ...field,
        fields:
          field.type === 'group' && 'name' in field && field.name === 'meta'
            ? compactSEOFields(children)
            : children,
      } as Field
    }
    return field
  })
  if (!pair) return nested
  const output: Field[] = []
  for (let index = 0; index < nested.length; index++) {
    const first = nested[index]!,
      second = nested[index + 1]
    if (
      second &&
      shortField(first) &&
      shortField(second) &&
      (first.type === 'checkbox') === (second.type === 'checkbox')
    ) {
      output.push(row([first, second]))
      index++
    } else output.push(ordinaryField(first) ? row([first]) : first)
  }
  return output
}
