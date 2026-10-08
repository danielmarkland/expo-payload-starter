import { betterAuthEnabled } from '@/lib/identity/server'
import { publishingDocumentPath } from '@danielmarkland/publishing-core/preview'
import { createPublishingRedirectAccess } from '@danielmarkland/publishing-core/payloadCollections'
import {
  createPublishingSearchOptions,
  publishingDescription,
} from '@danielmarkland/publishing-core/publishingRules'
import { siteTransferGatePlugin } from '@danielmarkland/publishing-core/siteTransfer'
import { moveSEOFieldsIntoTabs } from '@danielmarkland/publishing-core/payloadSEO'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { brand } from '@starter/brand'
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
import { extractSearchText } from '@danielmarkland/publishing-core/extractSearchText'
import {
  getContactEmailConfig,
  getSiteURL,
  getStorageConfig,
  getDatabasePoolConfig,
  getPayloadStorageOptions,
} from './lib/serverConfig'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const migrationDir = path.resolve(dirname, 'migrations')
const siteURL = getSiteURL()
const email = getContactEmailConfig()
const storage = getStorageConfig()

export default buildConfig({
  admin: {
    user: Users.slug,
    ...(betterAuthEnabled()
      ? {
          components: {
            views: { login: { Component: '/components/admin/EditorLogin#EditorLogin' } },
          },
        }
      : {}),
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
    pool: getDatabasePoolConfig(),
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
    s3Storage(getPayloadStorageOptions(storage)),
    seoPlugin({
      collections: ['pages', 'posts'],
      globals: ['siteSettings'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => (typeof doc?.title === 'string' ? doc.title : brand.siteTitle),
      generateDescription: ({ doc }) => publishingDescription(doc) || '',
      generateURL: ({ doc, collectionSlug }) => {
        const slug = typeof doc?.slug === 'string' ? doc.slug : ''
        return `${siteURL}${publishingDocumentPath(collectionSlug === 'posts' ? 'posts' : 'pages', slug)}`
      },
    }),
    moveSEOFieldsIntoTabs([Pages.slug, SiteSettings.slug]),
    redirectsPlugin({
      collections: ['pages', 'posts'],
      redirectTypes: ['301', '302'],
      overrides: {
        dbName: 'cms_redirects',
        access: createPublishingRedirectAccess(),
      },
    }),
    searchPlugin(createPublishingSearchOptions()),
    siteTransferGatePlugin({
      collections: [
        'media',
        'authors',
        'categories',
        'tags',
        'posts',
        'pages',
        'redirects',
        'search',
      ],
      globals: ['siteSettings', 'headerNavigation', 'footerNavigation'],
      scopes: async () => ['site'],
    }),
  ],
})
