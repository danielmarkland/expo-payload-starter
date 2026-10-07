import type { Access, Block, CollectionConfig, GlobalConfig } from 'payload'
import {
  createAuthorsFields,
  createCategoriesFields,
  createTagsFields,
  createPostsFields,
} from './payloadEditorial.js'
import { createPagesFields } from './payloadPages.js'
import { createSiteSettingsFields } from './payloadSiteSettings.js'
import {
  createHeaderNavigationFields,
  createFooterNavigationFields,
} from './payloadNavigation.js'

export const authenticatedEditor: Access = ({ req }) => Boolean(req.user)
export const publicRead: Access = () => true
export const publishedOrEditor: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
export function createPublishingAccess(
  read: Access,
): NonNullable<CollectionConfig['access']> {
  return {
    create: authenticatedEditor,
    delete: authenticatedEditor,
    read,
    update: authenticatedEditor,
  }
}
export function createPublishingGlobalAccess(
  read: Access,
): NonNullable<GlobalConfig['access']> {
  return { read, update: authenticatedEditor }
}
type EditorialOptions = {
  access: NonNullable<CollectionConfig['access']>
  indexes?: CollectionConfig['indexes']
  uniqueSlug?: boolean
}
type Preview = NonNullable<CollectionConfig['admin']>['preview']
function collectionIndexes(indexes: CollectionConfig['indexes']) {
  return indexes
    ? {
        indexes: indexes.map((index) => ({
          ...index,
          fields: [...index.fields],
        })),
      }
    : {}
}
const editorial = {
  authors: ['name', ['name', 'slug', 'updatedAt']],
  categories: ['title', ['title', 'slug', 'parent']],
  tags: ['title', ['title', 'slug']],
} as const
function taxonomy(
  slug: keyof typeof editorial,
  fields: CollectionConfig['fields'],
  options: EditorialOptions,
): CollectionConfig {
  const [useAsTitle, columns] = editorial[slug]
  return {
    slug,
    dbName: `cms_${slug}`,
    ...collectionIndexes(options.indexes),
    admin: { useAsTitle, defaultColumns: [...columns] },
    access: { ...options.access },
    fields,
  }
}
export function createAuthorsCollection(
  options: EditorialOptions,
): CollectionConfig {
  return taxonomy('authors', createAuthorsFields(options), options)
}
export function createCategoriesCollection(
  options: EditorialOptions,
): CollectionConfig {
  return taxonomy('categories', createCategoriesFields(options), options)
}
export function createTagsCollection(
  options: EditorialOptions,
): CollectionConfig {
  return taxonomy('tags', createTagsFields(options), options)
}
export function createPostsCollection(
  options: EditorialOptions & { preview: Preview },
): CollectionConfig {
  return {
    slug: 'posts',
    dbName: 'cms_posts',
    ...collectionIndexes(options.indexes),
    admin: { useAsTitle: 'title', preview: options.preview },
    access: { ...options.access },
    versions: { drafts: true },
    fields: createPostsFields(options),
  }
}
export function createPagesCollection(
  options: EditorialOptions & { preview: Preview; pageBlocks: Block[] },
): CollectionConfig {
  return {
    slug: 'pages',
    dbName: 'cms_pages',
    ...collectionIndexes(options.indexes),
    admin: {
      defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
      preview: options.preview,
      useAsTitle: 'title',
    },
    access: { ...options.access },
    versions: { drafts: true },
    fields: createPagesFields(options.pageBlocks, options),
  }
}
export function createMediaCollection({
  access,
  upload = true,
}: {
  access: NonNullable<CollectionConfig['access']>
  upload?: CollectionConfig['upload']
}): CollectionConfig {
  return {
    slug: 'media',
    dbName: 'cms_media',
    access: { ...access },
    fields: [{ name: 'alt', type: 'text', required: true }],
    upload,
  }
}
type SettingsOptions = NonNullable<
  Parameters<typeof createSiteSettingsFields>[0]
>
type HeaderOptions = Parameters<typeof createHeaderNavigationFields>[0]
type FooterOptions = Parameters<typeof createFooterNavigationFields>[0]
export function createSiteSettingsCollection({
  access,
  ...options
}: SettingsOptions & {
  access: NonNullable<CollectionConfig['access']>
}): CollectionConfig {
  return {
    slug: 'site-settings',
    labels: { singular: 'Site settings', plural: 'Site settings' },
    dbName: 'cms_site_settings',
    admin: {
      defaultColumns: ['siteTitle', 'updatedAt'],
      useAsTitle: 'siteTitle',
    },
    access: { ...access },
    fields: createSiteSettingsFields(options),
  }
}
export function createHeaderNavigationCollection({
  access,
  ...options
}: HeaderOptions & {
  access: NonNullable<CollectionConfig['access']>
}): CollectionConfig {
  return {
    slug: 'header-navigation',
    labels: { singular: 'Header navigation', plural: 'Header navigation' },
    dbName: 'cms_header_navigation',
    admin: { useAsTitle: 'id' },
    access: { ...access },
    fields: createHeaderNavigationFields(options),
  }
}
export function createFooterNavigationCollection({
  access,
  ...options
}: FooterOptions & {
  access: NonNullable<CollectionConfig['access']>
}): CollectionConfig {
  return {
    slug: 'footer-navigation',
    labels: { singular: 'Footer navigation', plural: 'Footer navigation' },
    dbName: 'cms_footer_navigation',
    admin: { useAsTitle: 'id' },
    access: { ...access },
    fields: createFooterNavigationFields(options),
  }
}
export function createSiteSettingsGlobal({
  access,
  ...options
}: SettingsOptions & {
  access: NonNullable<GlobalConfig['access']>
}): GlobalConfig {
  return {
    slug: 'siteSettings',
    label: 'Site settings',
    dbName: 'cms_site_settings',
    access: { ...access },
    fields: createSiteSettingsFields(options),
  }
}
export function createHeaderNavigationGlobal({
  access,
  ...options
}: HeaderOptions & {
  access: NonNullable<GlobalConfig['access']>
}): GlobalConfig {
  return {
    slug: 'headerNavigation',
    label: 'Header navigation',
    dbName: 'cms_header_navigation',
    access: { ...access },
    fields: createHeaderNavigationFields(options),
  }
}
export function createFooterNavigationGlobal({
  access,
  ...options
}: FooterOptions & {
  access: NonNullable<GlobalConfig['access']>
}): GlobalConfig {
  return {
    slug: 'footerNavigation',
    label: 'Footer navigation',
    dbName: 'cms_footer_navigation',
    access: { ...access },
    fields: createFooterNavigationFields(options),
  }
}

export function createPublishingRedirectAccess(): NonNullable<
  CollectionConfig['access']
> {
  return {
    create: authenticatedEditor,
    delete: authenticatedEditor,
    update: authenticatedEditor,
  }
}
