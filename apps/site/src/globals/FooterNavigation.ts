import { newsletterDestinationField } from '@danielmarkland/publishing-core/newsletterFields'
import { createFooterNavigationGlobal } from '@danielmarkland/publishing-core/payloadCollections'

import { appearanceField } from '@/blocks'
import { linkArrayPresentation, socialLinkFields, submitButtonFields } from '@/fields/linkFields'
import { navigationItemsField } from '@/fields/linkFields'

import { settingsAccess } from '@/lib/publishingPolicy'
export const FooterNavigation = createFooterNavigationGlobal({
  access: settingsAccess,
  newsletterDestinationField: newsletterDestinationField('/api/v1/newsletter/destinations'),
  navigationItemsField,
  appearanceField,
  linkArrayPresentation,
  socialLinkFields,
  submitButtonFields,
})
