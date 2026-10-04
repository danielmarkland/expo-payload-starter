import type { CollectionConfig } from 'payload'
import { createAuthorsFields } from '@danielmarkland/publishing-core/payloadEditorial'

export const Authors: CollectionConfig = {
  slug: 'authors',
  dbName: 'cms_authors',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'updatedAt'] },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: createAuthorsFields(),
}
