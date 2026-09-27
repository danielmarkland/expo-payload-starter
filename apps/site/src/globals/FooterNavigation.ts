import type { GlobalConfig } from 'payload'

import { navigationItemsField } from './navigationFields'

export const FooterNavigation: GlobalConfig = {
  slug: 'footerNavigation',
  label: 'Footer navigation',
  dbName: 'cms_footer_navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [navigationItemsField()],
}
