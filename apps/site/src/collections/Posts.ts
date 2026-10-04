import type { CollectionConfig } from 'payload'
import { createPostsFields } from '@danielmarkland/publishing-core/payloadEditorial'

import { getPreviewSecret, getSiteURL } from '@/lib/serverConfig'

export const Posts: CollectionConfig = {
  slug: 'posts',
  dbName: 'cms_posts',
  admin: {
    useAsTitle: 'title',
    preview: ({ data }) => {
      const siteURL = getSiteURL()
      const secret = getPreviewSecret()
      const slug = (data as { slug?: unknown }).slug
      return `${siteURL}/api/preview?collection=posts&slug=${encodeURIComponent(String(slug ?? ''))}&secret=${encodeURIComponent(secret)}`
    },
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    update: ({ req }) => Boolean(req.user),
  },
  versions: { drafts: true },
  fields: createPostsFields(),
}
