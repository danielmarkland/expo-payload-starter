import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Site settings',
  dbName: 'cms_site_settings',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Website favicon and web-app manifest icon. Use a square PNG or SVG.',
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      admin: { description: 'Fallback description for pages without their own SEO description.' },
    },
  ],
}
