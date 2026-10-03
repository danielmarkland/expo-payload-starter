import type { GlobalConfig } from 'payload'
import { brand } from '@starter/brand'
import { createSiteSettingsFields } from '@danielmarkland/publishing-core/payloadSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Site settings',
  dbName: 'cms_site_settings',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: createSiteSettingsFields({
    colorPickerFieldComponent: '@/components/admin/ColorPickerField#ColorPickerField',
    defaults: brand,
  }),
}
