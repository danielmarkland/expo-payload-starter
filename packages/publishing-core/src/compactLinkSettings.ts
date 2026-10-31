import type { Field } from 'payload'

const names = new Set([
  'treatment',
  'label',
  'type',
  'icon',
  'page',
  'post',
  'url',
  'newTab',
  'iconPosition',
  'iconOnly',
  'variant',
  'submitButtonVariant',
])
/** Shared link/action composition with separate responsive destination rows. */
export function compactLinkSettings(fields: Field[]): Field[] | undefined {
  fields = fields.flatMap((field) =>
    field.type === 'row' &&
    field.admin?.className === 'compact-link-row' &&
    Object.keys(field.admin ?? {}).every((key) => key === 'className')
      ? field.fields
      : [field],
  )
  if (
    !fields.length ||
    fields.some((field) => !('name' in field) || !names.has(field.name))
  )
    return
  const named = (name: string) =>
    fields.find((field) => 'name' in field && field.name === name)
  if (!named('icon') || (!named('label') && !named('submitButtonVariant')))
    return
  const used = new Set<Field>()
  const output: Field[] = []
  const row = (keys: string[]) => {
    const children = keys.flatMap((key) => {
      const field = named(key)
      if (!field || used.has(field)) return []
      used.add(field)
      return [{ ...field, admin: { ...field.admin, width: '50%' } } as Field]
    })
    if (children.length)
      output.push({
        type: 'row',
        admin: { className: 'compact-settings-row' },
        fields: children,
      })
  }
  row(named('type') ? ['label', 'type'] : ['label', 'icon'])
  // Each conditional destination retains its siblingData and its own row.
  for (const key of ['page', 'post', 'url']) {
    const field = named(key)
    if (field) {
      used.add(field)
      output.push({
        type: 'row',
        admin: { className: 'compact-editor-row' },
        fields: [
          { ...field, admin: { ...field.admin, width: '50%' } } as Field,
        ],
      })
    }
  }
  row(['icon', 'variant', 'submitButtonVariant', 'treatment'])
  row(['iconPosition', 'iconOnly', 'newTab'])
  for (const field of fields) if (!used.has(field)) output.push(field)
  return output
}
