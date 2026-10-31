import { describe, expect, it } from 'vitest'
import type { Field } from 'payload'
import { compactAdminFields } from './compactAdminFields.js'

describe('default native admin field layout', () => {
  it('preserves named paths and behavior through groups, arrays and tabs', () => {
    const validate = () => true
    const hook = ({ value }: { value: unknown }) => value
    const access = () => true
    const children: Field[] = [
      {
        name: 'label',
        type: 'text',
        required: true,
        validate,
        hooks: { beforeValidate: [hook] },
        access: { update: access },
      },
      { name: 'address', type: 'email', unique: true, index: true },
    ]
    const fields: Field[] = [
      { name: 'profile', type: 'group', fields: children },
      { name: 'contacts', type: 'array', fields: children },
      { type: 'tabs', tabs: [{ name: 'details', fields: children }] },
    ]
    const result = compactAdminFields(fields)
    for (const container of result) {
      const nested =
        container.type === 'tabs'
          ? container.tabs[0]!.fields
          : 'fields' in container
            ? container.fields
            : []
      expect(nested[0]).toMatchObject({
        type: 'row',
        fields: [
          { ...children[0], admin: { width: '50%' } },
          { ...children[1], admin: { width: '50%' } },
        ],
      })
    }
    expect(compactAdminFields(result)).toEqual(result)
    expect(fields[0]).toMatchObject({ name: 'profile', fields: children })
  })

  it('constrains ordinary single controls while preserving guarded placement and explicit layouts', () => {
    const condition = () => true
    const fields: Field[] = [
      { name: 'first', type: 'text' },
      { name: 'conditional', type: 'text', admin: { condition } },
      { name: 'hidden', type: 'text', admin: { hidden: true } },
      { name: 'slug', type: 'text', admin: { position: 'sidebar' } },
      {
        name: 'custom',
        type: 'text',
        admin: { components: { Field: '/Custom' } },
      },
      { name: 'full', type: 'text', admin: { width: '100%' } },
      { name: 'bio', type: 'textarea' },
      { name: 'image', type: 'upload', relationTo: 'media' },
      {
        name: 'related',
        type: 'relationship',
        relationTo: 'posts',
        hasMany: true,
      },
      { name: 'enabled', type: 'checkbox' },
      { name: 'last', type: 'text' },
    ]
    const result = compactAdminFields(fields)
    const flattened = result.flatMap((field) =>
      field.type === 'row' ? field.fields : [field],
    )
    expect(flattened.map((field) => 'name' in field && field.name)).toEqual(
      fields.map((field) => 'name' in field && field.name),
    )
    for (const index of [2, 3, 4, 5])
      expect(flattened[index]).toBe(fields[index])
    expect(flattened[1]?.admin?.condition).toBe(condition)
    for (const index of [0, 1, 6, 7, 8, 9, 10])
      expect(flattened[index]?.admin?.width).toBe('50%')
    expect(compactAdminFields(result)).toEqual(result)
    const row: Field = {
      type: 'row',
      admin: { condition },
      fields: fields.slice(0, 2),
    }
    expect(compactAdminFields([row])).toEqual([row])
  })
})
