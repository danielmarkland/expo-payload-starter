import type { Field, Payload } from 'payload'
import type { TransferResource } from './payload.js'

const fieldsByResource: Record<string, string[]> = {
  media: ['alt', 'focalX', 'focalY'],
  authors: ['name', 'slug', 'bio', 'image', 'website'],
  categories: ['title', 'slug', 'description', 'parent'],
  tags: ['title', 'slug', 'description'],
  pages: [
    'width',
    'headerVariant',
    'title',
    'slug',
    'layout',
    'customCSS',
    'meta',
  ],
  posts: [
    'title',
    'slug',
    'summary',
    'body',
    'author',
    'categories',
    'tags',
    'publishedAt',
    'showTableOfContents',
    'meta',
  ],
  redirects: ['from', 'to', 'type'],
  'site-settings': [
    'width',
    'siteTitle',
    'appTitle',
    'shortName',
    'lightLogo',
    'darkLogo',
    'favicon',
    'showHeaderLogo',
    'siteDescription',
    'appearance',
    'theme',
    'buttons',
    'archive',
    'meta',
  ],
  'header-navigation': [
    'variant',
    'helpLink',
    'socialLinks',
    'items',
    'appearance',
    'sticky',
    'showSearch',
    'searchIcon',
  ],
  'footer-navigation': [
    'layoutPreset',
    'detailsAlignment',
    'socialPlacement',
    'details',
    'items',
    'appearance',
    'newsletter',
    'contactForm',
    'tagline',
    'socialLinks',
    'latestPosts',
    'copyrightOwner',
  ],
}
export function selectTransferFields(
  fields: Field[],
  names: string[],
): Field[] {
  return fields.flatMap((field): Field[] => {
    if ('name' in field) return names.includes(field.name) ? [field] : []
    if (field.type === 'tabs')
      return field.tabs.flatMap((tab) =>
        'name' in tab && tab.name
          ? names.includes(tab.name)
            ? [{ type: 'group', name: tab.name, fields: tab.fields }]
            : []
          : selectTransferFields(tab.fields, names),
      )
    if ('fields' in field) return selectTransferFields(field.fields, names)
    return []
  })
}
// Applications supply scope/access/locks separately. This list only describes editorial fields.
export function publishingTransferResources(
  payload: Payload,
  globals = true,
): TransferResource[] {
  return Object.entries(fieldsByResource)
    .filter(
      ([key]) =>
        Boolean(payload.collections[key]) ||
        (globals &&
          ['site-settings', 'header-navigation', 'footer-navigation'].includes(
            key,
          )),
    )
    .map(([key, names]) => {
      const globalSlug = (
        {
          'site-settings': 'siteSettings',
          'header-navigation': 'headerNavigation',
          'footer-navigation': 'footerNavigation',
        } as Record<string, string>
      )[key]
      const collection = payload.collections[key]?.config
      const global = payload.config.globals.find((g) => g.slug === globalSlug)
      if (!collection && !global)
        throw new Error(`Missing publishing resource ${key}`)
      const config = collection || global!
      return {
        key,
        slug: collection ? key : global!.slug,
        kind: collection ? 'collection' : 'global',
        fields: selectTransferFields(config.fields, names),
        drafts: Boolean(config.versions && config.versions.drafts),
        media: key === 'media',
        excludedPaths:
          key === 'footer-navigation'
            ? ['newsletter.groupId']
            : key === 'site-settings'
              ? ['integrations']
              : undefined,
      }
    })
}
