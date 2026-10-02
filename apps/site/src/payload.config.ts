import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { brand } from '@danielmarkland/design-tokens'
import { Users } from './collections/Users'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { FooterNavigation } from './globals/FooterNavigation'
import { HeaderNavigation } from './globals/HeaderNavigation'
import { SiteSettings } from './globals/SiteSettings'
import { extractSearchText } from '@danielmarkland/publishing-core'
import { getContactEmailConfig, getSiteURL, getStorageConfig } from './lib/serverConfig'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const migrationDir = process.cwd().endsWith(path.join('apps', 'site'))
  ? path.resolve(process.cwd(), 'src/migrations')
  : path.resolve(process.cwd(), 'apps/site/src/migrations')
const siteURL = getSiteURL()
const email = getContactEmailConfig()
const storage = getStorageConfig()

const moveSEOFieldsIntoTabs: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) => {
    if (collection.slug !== Pages.slug) return collection

    const seoField = collection.fields.find((field) => 'name' in field && field.name === 'meta')
    const tabsField = collection.fields.find((field) => field.type === 'tabs')
    if (!seoField || !tabsField || tabsField.type !== 'tabs') return collection

    return {
      ...collection,
      fields: collection.fields
        .filter((field) => field !== seoField)
        .map((field) =>
          field === tabsField
            ? {
                ...tabsField,
                tabs: tabsField.tabs.map((tab) =>
                  tab.label === 'SEO' ? { ...tab, fields: [...tab.fields, seoField] } : tab,
                ),
              }
            : field,
        ),
    }
  }),
  globals: config.globals?.map((global) => {
    if (global.slug !== SiteSettings.slug) return global

    const seoField = global.fields.find((field) => 'name' in field && field.name === 'meta')
    const tabsField = global.fields.find((field) => field.type === 'tabs')
    if (!seoField || !tabsField || tabsField.type !== 'tabs') return global

    return {
      ...global,
      fields: global.fields
        .filter((field) => field !== seoField)
        .map((field) =>
          field === tabsField
            ? {
                ...tabsField,
                tabs: tabsField.tabs.map((tab) =>
                  tab.label === 'SEO' ? { ...tab, fields: [...tab.fields, seoField] } : tab,
                ),
              }
            : field,
        ),
    }
  }),
})

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Authors, Categories, Tags, Posts, Pages],
  cors: [siteURL],
  csrf: [siteURL],
  editor: lexicalEditor(),
  globals: [HeaderNavigation, FooterNavigation, SiteSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    migrationDir,
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  email:
    email.apiKey && email.fromAddress
      ? resendAdapter({
          apiKey: email.apiKey,
          defaultFromAddress: email.fromAddress,
          defaultFromName: brand.siteTitle,
        })
      : undefined,
  sharp,
  plugins: [
    s3Storage({
      // Payload must use remote storage on Vercel; silently disabling the adapter
      // makes uploads fall back to an unavailable local filesystem.
      enabled:
        process.env.VERCEL === '1' || Boolean(storage.accessKeyId && storage.secretAccessKey),
      bucket: storage.bucket,
      collections: { media: true },
      config: {
        credentials: {
          accessKeyId: storage.accessKeyId,
          secretAccessKey: storage.secretAccessKey,
        },
        endpoint: storage.endpoint,
        forcePathStyle: true,
        region: storage.region,
      },
    }),
    seoPlugin({
      collections: ['pages', 'posts'],
      globals: ['siteSettings'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => (typeof doc?.title === 'string' ? doc.title : brand.siteTitle),
      generateDescription: ({ doc }) =>
        typeof doc?.summary === 'string'
          ? doc.summary
          : typeof doc?.siteDescription === 'string'
            ? doc.siteDescription
            : undefined,
      generateURL: ({ doc, collectionSlug }) => {
        const slug = typeof doc?.slug === 'string' ? doc.slug : ''
        return collectionSlug === 'posts' ? `${siteURL}/posts/${slug}` : `${siteURL}/${slug}`
      },
    }),
    moveSEOFieldsIntoTabs,
    redirectsPlugin({
      collections: ['pages', 'posts'],
      redirectTypes: ['301', '302'],
      overrides: {
        dbName: 'cms_redirects',
        access: {
          create: ({ req }) => Boolean(req.user),
          delete: ({ req }) => Boolean(req.user),
          update: ({ req }) => Boolean(req.user),
        },
      },
    }),
    searchPlugin({
      collections: ['pages', 'posts'],
      defaultPriorities: { pages: 10, posts: 20 },
      searchOverrides: {
        dbName: 'cms_search',
        access: { create: () => false, delete: () => false, update: () => false, read: () => true },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'excerpt', type: 'textarea' },
          { name: 'searchText', type: 'textarea', index: true },
        ],
      },
      beforeSync: ({ collectionSlug, originalDoc, searchDoc }) => ({
        ...searchDoc,
        excerpt: collectionSlug === 'posts' ? originalDoc.summary || '' : '',
        searchText: extractSearchText(originalDoc),
      }),
    }),
  ],
})
