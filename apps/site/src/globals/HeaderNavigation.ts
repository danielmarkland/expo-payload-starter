import type { GlobalConfig } from 'payload'

import { navigationItemsField } from './navigationFields'

export const HeaderNavigation: GlobalConfig = {
  slug: 'headerNavigation',
  label: 'Header navigation',
  dbName: 'cms_header_navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [navigationItemsField()],
}
