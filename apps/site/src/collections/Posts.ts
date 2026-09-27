import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  dbName: 'cms_posts',
  admin: {
    useAsTitle: 'title',
    preview: ({ data }) => {
      const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const secret = process.env.PREVIEW_SECRET || ''
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
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', index: true, required: true, unique: true },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'body', type: 'richText', required: true },
    { name: 'author', type: 'relationship', relationTo: 'authors' },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'publishedAt', type: 'date' },
  ],
}
