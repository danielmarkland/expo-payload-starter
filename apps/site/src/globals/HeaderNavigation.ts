import { createHeaderNavigationGlobal } from '@danielmarkland/publishing-core/payloadCollections'

import { iconPickerFieldComponent } from '@/fields/linkFields'

import { headerNavigationIconOptions, navigationItemsField } from '@/fields/linkFields'

import { settingsAccess } from '@/lib/publishingPolicy'
export const HeaderNavigation = createHeaderNavigationGlobal({
  access: settingsAccess,
  navigationItemsField,
  iconPickerFieldComponent,
  headerNavigationIconOptions,
})
