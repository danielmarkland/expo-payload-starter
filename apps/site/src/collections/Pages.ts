import type { CollectionConfig } from 'payload'

import { pageBlocks } from '@/blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  dbName: 'cms_pages',
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    preview: ({ data }) => {
      const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const secret = process.env.PREVIEW_SECRET || ''
      const slug = (data as { slug?: unknown }).slug
      return `${siteURL}/api/preview?collection=pages&slug=${encodeURIComponent(String(slug ?? ''))}&secret=${encodeURIComponent(secret)}`
    },
    useAsTitle: 'title',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    update: ({ req }) => Boolean(req.user),
  },
  versions: { drafts: true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'slug', type: 'text', index: true, required: true, unique: true },
          ],
        },
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: pageBlocks,
              required: true,
            },
            {
              type: 'collapsible',
              label: 'Advanced presentation',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'customCSS',
                  label: 'Custom page CSS',
                  type: 'code',
                  admin: {
                    description:
                      'Optional escape hatch for trusted editors. Scope selectors to [data-page] to avoid affecting the admin or other pages.',
                    language: 'css',
                  },
                  validate: (value: null | string | undefined) =>
                    !value || !/<\s*\/\s*style/i.test(value)
                      ? true
                      : 'Closing style tags are not allowed.',
                },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [] },
      ],
    },
  ],
}
