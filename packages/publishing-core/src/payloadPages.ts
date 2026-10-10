import { sectionWidthField } from './sectionWidth.js'
import type { Block, Field } from 'payload'

export function createPagesFields(
  pageBlocks: Block[],
  { uniqueSlug = true }: { uniqueSlug?: boolean } = {},
): Field[] {
  return [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            sectionWidthField('page'),
            { name: 'title', type: 'text', required: true },
            {
              name: 'headerVariant',
              type: 'select',
              options: ['inherit', 'standard', 'minimal'],
            },
            {
              name: 'slug',
              type: 'text',
              index: true,
              required: true,
              unique: uniqueSlug,
            },
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
  ]
}
