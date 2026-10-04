import { createHeaderNavigationFields } from '@danielmarkland/publishing-core/payloadNavigation'
import type { GlobalConfig } from 'payload'

import { iconPickerFieldComponent } from '@/fields/linkFields'

import { headerNavigationIconOptions, navigationItemsField } from './navigationFields'

export const HeaderNavigation: GlobalConfig = {
  slug: 'headerNavigation',
  label: 'Header navigation',
  dbName: 'cms_header_navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: createHeaderNavigationFields({
    navigationItemsField,
    iconPickerFieldComponent,
    headerNavigationIconOptions,
  }),
}
