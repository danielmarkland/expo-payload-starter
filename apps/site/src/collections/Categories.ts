import type { CollectionConfig } from 'payload'
import { createCategoriesFields } from '@danielmarkland/publishing-core/payloadEditorial'

export const Categories: CollectionConfig = {
  slug: 'categories',
  dbName: 'cms_categories',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'parent'] },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: createCategoriesFields(),
}
