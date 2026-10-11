import { describe, expect, it } from 'vitest'
import { createHeaderNavigationFields } from './payloadNavigation.js'

describe('header background CMS fields', () => {
  it('offers independent fill/transparent controls defaulting to fill', () => {
    const fields = createHeaderNavigationFields({
      navigationItemsField: () => ({
        name: 'items',
        type: 'array',
        fields: [],
      }),
      iconPickerFieldComponent: {},
      headerNavigationIconOptions: [],
    })
    for (const name of ['topBackground', 'scrolledBackground']) {
      const field = fields.find(
        (field) => 'name' in field && field.name === name,
      )
      expect(field).toMatchObject({
        type: 'select',
        defaultValue: 'fill',
        options: [
          { label: 'Fill', value: 'fill' },
          { label: 'Transparent', value: 'transparent' },
        ],
      })
    }
  })
})
