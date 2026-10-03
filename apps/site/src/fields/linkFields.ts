import { createPublishingFields } from '@danielmarkland/publishing-core/payloadFields'
import { linkIconOptions, socialIconOptions } from '@/lib/linkIcons'

export { linkIconOptions, socialIconOptions }
export { validateSafeURL, validateExternalURL } from '@danielmarkland/publishing-core/payloadFields'

export const {
  navigationItemsField,
  actionFields,
  destinationFields,
  iconFields,
  linkFields,
  socialLinkFields,
  submitButtonFields,
  linkArrayPresentation,
  iconPickerFieldComponent,
} = createPublishingFields({
  linkIconOptions,
  socialIconOptions,
  iconPickerFieldComponent: { Field: '@/components/admin/IconPickerField#IconPickerField' },
  linkRowLabel: '@/components/admin/LinkRowLabel#LinkRowLabel',
})
