import type { CollectionConfig } from 'payload'
import { createTagsFields } from '@danielmarkland/publishing-core/payloadEditorial'

export const Tags: CollectionConfig = {
  slug: 'tags',
  dbName: 'cms_tags',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: createTagsFields(),
}
