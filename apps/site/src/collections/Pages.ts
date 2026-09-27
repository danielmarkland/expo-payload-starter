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
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', index: true, required: true, unique: true },
    {
      name: 'layout',
      type: 'blocks',
      blocks: pageBlocks,
      required: true,
    },
  ],
}
