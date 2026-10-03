import { createFooterNavigationFields } from '@danielmarkland/publishing-core/payloadNavigation'
import type { GlobalConfig } from 'payload'

import { appearanceField } from '@/blocks'
import { linkArrayPresentation, socialLinkFields, submitButtonFields } from '@/fields/linkFields'
import { navigationItemsField } from './navigationFields'

export const FooterNavigation: GlobalConfig = {
  slug: 'footerNavigation',
  label: 'Footer navigation',
  dbName: 'cms_footer_navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: createFooterNavigationFields({
    navigationItemsField,
    appearanceField,
    linkArrayPresentation,
    socialLinkFields,
    submitButtonFields,
  }),
}
