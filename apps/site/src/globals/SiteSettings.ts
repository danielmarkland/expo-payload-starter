import { brand } from '@starter/brand'
import { createSiteSettingsGlobal } from '@danielmarkland/publishing-core/payloadCollections'

import { settingsAccess } from '@/lib/publishingPolicy'
export const SiteSettings = createSiteSettingsGlobal({
  access: settingsAccess,
  colorPickerFieldComponent: '@/components/admin/ColorPickerField#ColorPickerField',
  defaults: brand,
})
