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
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional site logo. The site title is shown when no logo is selected.',
      },
    },
    navigationItemsField({ includeIcons: true }),
  ],
}
