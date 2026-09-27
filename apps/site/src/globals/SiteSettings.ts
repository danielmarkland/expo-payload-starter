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
      name: 'siteDescription',
      type: 'textarea',
      admin: { description: 'Fallback description for pages without their own SEO description.' },
    },
  ],
}
