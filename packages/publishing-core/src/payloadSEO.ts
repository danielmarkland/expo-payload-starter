import type { Field, Plugin } from 'payload'

/** Keep plugin controls and paths intact while composing two responsive rows. */
export function compactSEOFields(fields: Field[]): Field[] {
  const title = fields.find(
    (field) => 'name' in field && field.name === 'title',
  )
  const description = fields.find(
    (field) => 'name' in field && field.name === 'description',
  )
  const image = fields.find(
    (field) => 'name' in field && field.name === 'image',
  )
  const component = title?.admin?.components?.Field
  const path =
    typeof component === 'string'
      ? component
      : component && 'path' in component
        ? component.path
        : ''
  if (!title || !description || !path.startsWith('@payloadcms/plugin-seo/'))
    return fields
  const imageComponents =
    image?.type === 'upload' ? image.admin?.components : undefined
  const controls = new Set([title, description, ...(image ? [image] : [])])
  const preview = fields.find(
    (field) => field.type === 'ui' && field.name === 'preview',
  )
  const row = (children: Field[]): Field => ({
    type: 'row',
    admin: { className: 'compact-editor-row compact-seo-row' },
    fields: children.map(
      (field) =>
        ({
          ...field,
          required: true,
          admin: {
            ...field.admin,
            width: '50%',
            ...(field === image
              ? {
                  description:
                    'Used when this page is shared. Recommended image size: 1200 × 630 pixels.',
                  components: {
                    ...imageComponents,
                    Label: imageComponents?.Label ?? {
                      path: '@danielmarkland/publishing-ui/admin/SEOMetaImageLabel#SEOMetaImageLabel',
                    },
                  },
                }
              : {}),
          },
        }) as Field,
    ),
  })
  let placed = false
  const layout = fields.flatMap((field) => {
    if (!controls.has(field)) return [field]
    if (placed) return []
    placed = true
    return [row([title, ...(image ? [image] : [])]), row([description])]
  })
  return preview
    ? [preview, ...layout.filter((field) => field !== preview)]
    : layout
}

export const moveSEOFieldsIntoTabs =
  (slugs: string[]): Plugin =>
  (config) => {
    function fieldsFor(slug: string, fields: Field[]): Field[] {
      if (!slugs.includes(slug)) return fields
      const seo = fields.find(
        (field) => 'name' in field && field.name === 'meta',
      )
      const tabs = fields.find((field) => field.type === 'tabs')
      if (
        !seo ||
        !tabs ||
        tabs.type !== 'tabs' ||
        !tabs.tabs.some((tab) => tab.label === 'SEO')
      )
        return fields
      return fields
        .filter((field) => field !== seo)
        .map((field) =>
          field === tabs
            ? {
                ...tabs,
                tabs: tabs.tabs.map((tab) =>
                  tab.label === 'SEO'
                    ? { ...tab, fields: [...tab.fields, seo] }
                    : tab,
                ),
              }
            : field,
        )
    }
    return {
      ...config,
      collections: config.collections?.map((collection) => ({
        ...collection,
        fields: fieldsFor(collection.slug, collection.fields),
      })),
      globals: config.globals?.map((global) => ({
        ...global,
        fields: fieldsFor(global.slug, global.fields),
      })),
    }
  }
