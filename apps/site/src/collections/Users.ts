import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  dbName: 'cms_users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const existing = await req.payload.find({
            collection: 'users',
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          // Payload's first-user operation bypasses collection access. Ensure that
          // first account can actually administer the standalone CMS.
          if (!existing.totalDocs) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: ['admin', 'editor'],
      required: true,
      saveToJWT: true,
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
