import type { Field, Plugin, LabelFunction, StaticLabel } from 'payload'
import { compactSiteSettings } from './compactSiteSettings.js'
import { compactBlockSettings } from './compactBlockSettings.js'
import { titleCaseFields } from './titleCaseFields.js'
import { compactAdminFields } from './compactAdminFields.js'

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

/** Deliberate field pairs; unnamed rows preserve paths and native behavior. */
function compactEditorFields(slug: string, fields: Field[]): Field[] {
  const pairs: Record<string, string[][]> = {
    authors: [
      ['name', 'slug'],
      ['image', 'website'],
    ],
    categories: [['title', 'slug'], ['parent'], ['description']],
    tags: [['title', 'slug'], ['description']],
    posts: [
      ['author', 'publishedAt'],
      ['categories', 'tags'],
    ],
    'footer-navigation': [['title', 'background']],
    footerNavigation: [['title', 'background']],
  }
  const nested = fields.map((field): Field =>
    field.type === 'tabs'
      ? {
          ...field,
          tabs: field.tabs.map((tab) =>
            'name' in tab && tab.name
              ? tab
              : { ...tab, fields: compactEditorFields(slug, tab.fields) },
          ),
        }
      : field,
  )
  if (slug === 'categories') {
    const parent = nested.findIndex(
      (field) => 'name' in field && field.name === 'parent',
    )
    const description = nested.findIndex(
      (field) => 'name' in field && field.name === 'description',
    )
    if (description >= 0 && parent > description) {
      const [field] = nested.splice(parent, 1)
      nested.splice(description, 0, field!)
    }
  }
  for (const pair of pairs[slug] ?? []) {
    const indexes = pair.map((name) =>
      nested.findIndex(
        (field) =>
          'name' in field &&
          field.name === name &&
          field.admin?.position !== 'sidebar',
      ),
    )
    if (indexes.some((index) => index < 0)) continue
    const children = indexes.map((index) => nested[index]!)
    const first = Math.min(...indexes)
    const row: Field = {
      type: 'row',
      admin: { className: 'compact-editor-row' },
      fields: children.map(
        (field) =>
          ({
            ...field,
            admin: { ...field.admin, width: '50%' },
          }) as Field,
      ),
    }
    for (const index of [...indexes].sort((a, b) => b - a))
      nested.splice(index, 1)
    nested.splice(first, 0, row)
  }
  return nested
}

/** Rearrange unnamed layout containers only; no stored field names change. */
function editorFields(slug: string, fields: Field[]): Field[] {
  if (
    ['header-navigation', 'headerNavigation'].includes(slug) &&
    !fields.some((field) => field.type === 'tabs')
  ) {
    const menu = new Set(['items'])
    const utility = new Set([
      'helpLink',
      'socialLinks',
      'showSearch',
      'searchIcon',
    ])
    const appearance = new Set([
      'variant',
      'topBackground',
      'scrolledBackground',
      'sticky',
    ])
    const selected = (names: Set<string>) =>
      fields.filter((field) => 'name' in field && names.has(field.name))
    const design = selected(appearance)
    return [
      {
        type: 'tabs',
        tabs: [
          { label: 'Menu Links', fields: selected(menu) },
          { label: 'Utility Links', fields: selected(utility) },
        ],
      },
      ...(design.length
        ? [
            {
              type: 'collapsible' as const,
              label: 'Header Appearance',
              admin: { initCollapsed: true },
              fields: design,
            },
          ]
        : []),
      ...fields.filter(
        (field) =>
          !('name' in field) ||
          ![menu, utility, appearance].some((names) => names.has(field.name)),
      ),
    ]
  }
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
    return fields.map((field) => {
      if (
        field.type !== 'tabs' ||
        field.tabs.some((tab) => 'name' in tab && tab.name) ||
        !field.tabs.some((tab) => tab.label === 'General')
      )
        return field
      const from = (label: string) =>
        field.tabs
          .filter((tab) => tab.label === label)
          .flatMap((tab) => tab.fields)
      const general = from('General')
      const seo = from('SEO')
      const fallback = seo.filter(
        (child) => 'name' in child && child.name === 'siteDescription',
      )
      const collapsed = (label: string, children: Field[]): Field[] =>
        children.length
          ? [
              {
                type: 'collapsible',
                label,
                admin: { initCollapsed: true },
                fields: children,
              },
            ]
          : []
      const known = new Set([
        'General',
        'Branding',
        'Appearance',
        'Archives',
        'Integrations',
        'SEO',
      ])
      return {
        ...field,
        tabs: [
          {
            label: 'Site',
            fields: [
              ...general.filter(
                (child) => !('name' in child) || child.name !== 'width',
              ),
              ...fallback,
              ...collapsed('Post Listings', from('Archives')),
              ...collapsed('Public Integrations', from('Integrations')),
            ],
          },
          {
            label: 'Design',
            fields: [
              ...from('Branding'),
              ...general.filter(
                (child) => 'name' in child && child.name === 'width',
              ),
              ...from('Appearance'),
            ],
          },
          {
            label: 'SEO',
            fields: seo.filter(
              (child) => !('name' in child) || child.name !== 'siteDescription',
            ),
          },
          ...field.tabs.filter(
            (tab) => typeof tab.label !== 'string' || !known.has(tab.label),
          ),
        ],
      }
    })
  return fields
}

/** Run after schema-producing plugins. Unnamed rows preserve stored field paths. */
export function publishingAdminPresentation(): Plugin {
  const fields = (slug: string, value: Field[]) => [
    ...compactAdminFields(
      titleCaseFields(
        compactBlockSettings(
          ['site-settings', 'siteSettings'].includes(slug)
            ? compactSiteSettings(editorFields(slug, value))
            : compactEditorFields(slug, editorFields(slug, value)),
        ),
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
