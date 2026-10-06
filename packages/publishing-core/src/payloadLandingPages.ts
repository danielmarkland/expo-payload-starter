import type { CollectionConfig } from 'payload'

export function createLandingPagesCollection({
  access,
  indexes,
}: {
  access: NonNullable<CollectionConfig['access']>
  indexes?: CollectionConfig['indexes']
}): CollectionConfig {
  return {
    slug: 'landing-pages',
    labels: { singular: 'Landing page', plural: 'Landing pages' },
    dbName: 'cms_landing_pages',
    ...(indexes ? { indexes } : {}),
    admin: {
      defaultColumns: ['surface', 'heading', 'enabled', '_status', 'updatedAt'],
      useAsTitle: 'surface',
    },
    access,
    versions: { drafts: true },
    fields: [
      {
        name: 'surface',
        type: 'select',
        options: [
          { label: 'Website', value: 'web' },
          { label: 'App', value: 'app' },
        ],
        required: true,
      },
      {
        name: 'enabled',
        type: 'checkbox',
        defaultValue: true,
        required: true,
      },
      {
        name: 'showLogo',
        type: 'checkbox',
        defaultValue: true,
        label: 'Show tenant logo',
        admin: {
          description: 'Display only the tenant logo centered on the screen.',
        },
        required: true,
      },
      {
        name: 'eyebrow',
        type: 'text',
        admin: { condition: (_, siblingData) => !siblingData.showLogo },
      },
      {
        name: 'heading',
        type: 'text',
        admin: { condition: (_, siblingData) => !siblingData.showLogo },
      },
      {
        name: 'body',
        type: 'textarea',
        admin: {
          condition: (_, siblingData) => !siblingData.showLogo,
          description: 'Optional supporting text shown below the heading.',
        },
      },
    ],
  }
}
