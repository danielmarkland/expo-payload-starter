import type { Field, Plugin, LabelFunction, StaticLabel } from 'payload'
import { compactSiteSettings } from './compactSiteSettings.js'
import { compactBlockSettings } from './compactBlockSettings.js'
import { titleCaseFields } from './titleCaseFields.js'

export { titleCase } from './titleCase.js'
export { titleCaseFields } from './titleCaseFields.js'
export { compactBlockSettings } from './compactBlockSettings.js'
export { compactLinkSettings } from './compactLinkSettings.js'
export { compactSiteSettings } from './compactSiteSettings.js'

function relabel(
  value: LabelFunction | StaticLabel | undefined,
  english: string,
): LabelFunction | StaticLabel {
  if (typeof value === 'function') return value
  return value && typeof value === 'object'
    ? { ...value, en: english }
    : english
}

export const adminDateFormat = 'MMM d, yyyy, h:mm a'

/** Rearrange unnamed layout containers only; no stored field names change. */
function editorFields(slug: string, fields: Field[]): Field[] {
  if (slug === 'posts' && !fields.some((field) => field.type === 'tabs')) {
    const organization = new Set([
      'author',
      'categories',
      'tags',
      'publishedAt',
      'showTableOfContents',
    ])
    const sidebar = fields
      .filter((field) => 'name' in field && field.name === 'slug')
      .map(
        (field) =>
          ({
            ...field,
            admin: { ...field.admin, position: 'sidebar' as const },
          }) as Field,
      )
    const body = fields.filter(
      (field) => !('name' in field) || field.name !== 'slug',
    )
    return [
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Content',
            fields: body.filter(
              (field) =>
                !('name' in field) ||
                (!organization.has(field.name) && field.name !== 'meta'),
            ),
          },
          {
            label: 'Organization',
            fields: body.filter(
              (field) => 'name' in field && organization.has(field.name),
            ),
          },
          {
            label: 'SEO',
            fields: body.filter(
              (field) => 'name' in field && field.name === 'meta',
            ),
          },
        ],
      },
      ...sidebar,
    ]
  }
  if (slug === 'pages') {
    const sidebar: Field[] = []
    const next = fields.map((field) => {
      if (
        field.type !== 'tabs' ||
        field.tabs.some((tab) => 'name' in tab && tab.name)
      )
        return field
      const all = field.tabs.flatMap((tab) => tab.fields)
      const appearance = new Set(['width', 'headerVariant', 'customCSS'])
      for (const child of all)
        if ('name' in child && child.name === 'slug')
          sidebar.push({
            ...child,
            admin: { ...child.admin, position: 'sidebar' },
          } as Field)
      return {
        ...field,
        tabs: [
          {
            label: 'Content',
            fields: all.filter(
              (child) =>
                'name' in child &&
                !appearance.has(child.name) &&
                child.name !== 'slug' &&
                child.name !== 'meta',
            ),
          },
          {
            label: 'Appearance',
            fields: all.filter(
              (child) => !('name' in child) || appearance.has(child.name),
            ),
          },
          {
            label: 'SEO',
            fields: all.filter(
              (child) => 'name' in child && child.name === 'meta',
            ),
          },
        ],
      }
    })
    return [...next, ...sidebar]
  }
  if (slug === 'site-settings' || slug === 'siteSettings')
    return fields.map((field) =>
      field.type === 'tabs' &&
      !field.tabs.some((tab) => 'name' in tab && tab.name) &&
      field.tabs.some((tab) => tab.label === 'General')
        ? {
            ...field,
            tabs: [
              {
                label: 'Site',
                fields: field.tabs
                  .filter(
                    (tab) =>
                      tab.label === 'General' || tab.label === 'Branding',
                  )
                  .flatMap((tab) => tab.fields),
              },
              ...field.tabs
                .filter(
                  (tab) => tab.label !== 'General' && tab.label !== 'Branding',
                )
                .map((tab) =>
                  tab.label === 'Appearance'
                    ? { ...tab, label: 'Design' }
                    : tab,
                ),
            ],
          }
        : field,
    )
  return fields
}

/** Run after schema-producing plugins. Unnamed rows preserve stored field paths. */
export function publishingAdminPresentation(): Plugin {
  const fields = (slug: string, value: Field[]) => [
    ...titleCaseFields(
      compactBlockSettings(
        ['site-settings', 'siteSettings'].includes(slug)
          ? compactSiteSettings(editorFields(slug, value))
          : editorFields(slug, value),
      ),
    ),
    {
      name: 'adminUnsavedChanges',
      type: 'ui' as const,
      admin: {
        components: {
          Field:
            '@danielmarkland/publishing-ui/admin/UnsavedChanges#NativeFormState',
        },
      },
    },
  ]
  const content = new Set([
    'posts',
    'pages',
    'media',
    'authors',
    'categories',
    'tags',
  ])
  const site = new Set([
    'users',
    'site-settings',
    'header-navigation',
    'footer-navigation',
    'landing-pages',
    'redirects',
    'siteSettings',
    'headerNavigation',
    'footerNavigation',
  ])
  const labels: Record<string, string> = {
    'site-settings': 'Site Settings',
    siteSettings: 'Site Settings',
    'header-navigation': 'Header',
    headerNavigation: 'Header',
    'footer-navigation': 'Footer',
    footerNavigation: 'Footer',
    'landing-pages': 'Landing Pages',
  }
  return (config) => ({
    ...config,
    admin: {
      ...config.admin,
      dateFormat: adminDateFormat,
      components: {
        ...config.admin?.components,
        providers: [
          ...(config.admin?.components?.providers ?? []),
          '@danielmarkland/publishing-ui/admin/UnsavedChanges#UnsavedChangesProvider',
        ],
      },
    },
    collections: config.collections
      ?.map((collection) => ({
        ...collection,
        ...(labels[collection.slug]
          ? {
              labels: {
                ...collection.labels,
                singular: relabel(
                  collection.labels?.singular,
                  labels[collection.slug]!,
                ),
                plural: relabel(
                  collection.labels?.plural,
                  labels[collection.slug]!,
                ),
              },
            }
          : {}),
        admin: {
          ...collection.admin,
          ...(collection.slug === 'search' ? { hidden: true } : {}),
          ...(content.has(collection.slug)
            ? { group: 'Content' }
            : site.has(collection.slug)
              ? { group: 'Site' }
              : {}),
        },
        fields: fields(collection.slug, collection.fields),
      }))
      .sort((a, b) => {
        const rank = (slug: string) =>
          content.has(slug)
            ? [
                'posts',
                'pages',
                'media',
                'authors',
                'categories',
                'tags',
              ].indexOf(slug)
            : site.has(slug)
              ? 10
              : 20
        return rank(a.slug) - rank(b.slug)
      }),
    globals: config.globals?.map((global) => ({
      ...global,
      ...(labels[global.slug]
        ? { label: relabel(global.label, labels[global.slug]!) }
        : {}),
      admin: {
        ...global.admin,
        ...(site.has(global.slug) ? { group: 'Site' } : {}),
      },
      fields: fields(global.slug, global.fields),
    })),
  })
}
