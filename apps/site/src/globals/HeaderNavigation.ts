import type { GlobalConfig } from 'payload'

import { headerNavigationIconOptions, navigationItemsField } from './navigationFields'

export const HeaderNavigation: GlobalConfig = {
  slug: 'headerNavigation',
  label: 'Header navigation',
  dbName: 'cms_header_navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    navigationItemsField({ includeIcons: true }),
    {
      name: 'showSearch',
      type: 'checkbox',
      admin: { description: 'Show the built-in Search link after the navigation items.' },
      defaultValue: true,
      label: 'Show search link',
      required: true,
    },
    {
      name: 'searchIcon',
      type: 'select',
      admin: {
        condition: (data) => data?.showSearch !== false,
        description: 'Optional icon that replaces the visible Search label.',
      },
      label: 'Search icon',
      options: headerNavigationIconOptions,
    },
  ],
}
