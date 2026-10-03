import { createPagesFields } from '@danielmarkland/publishing-core/payloadPages'
import type { CollectionConfig } from 'payload'

import { pageBlocks } from '@/blocks'
import { getPreviewSecret, getSiteURL } from '@/lib/serverConfig'

export const Pages: CollectionConfig = {
  slug: 'pages',
  dbName: 'cms_pages',
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    preview: ({ data }) => {
      const siteURL = getSiteURL()
      const secret = getPreviewSecret()
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
  fields: createPagesFields(pageBlocks),
}
