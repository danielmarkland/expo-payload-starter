import type { Field, Plugin } from 'payload'

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
