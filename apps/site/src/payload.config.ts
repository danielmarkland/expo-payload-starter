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

import { brand } from '@starter/design-tokens'
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
import { extractSearchText } from './lib/extractSearchText'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Authors, Categories, Tags, Posts, Pages],
  cors: [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_SITE_URL].filter(
    (origin): origin is string => Boolean(origin),
  ),
  csrf: [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_SITE_URL].filter(
    (origin): origin is string => Boolean(origin),
  ),
  editor: lexicalEditor(),
  globals: [HeaderNavigation, FooterNavigation, SiteSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'hello@example.com',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Daniel Markland',
      })
    : undefined,
  sharp,
  plugins: [
    s3Storage({
      // Payload must use remote storage on Vercel; silently disabling the adapter
      // makes uploads fall back to an unavailable local filesystem.
      enabled:
        process.env.VERCEL === '1' ||
        Boolean(process.env.SUPABASE_S3_ACCESS_KEY_ID && process.env.SUPABASE_S3_SECRET_ACCESS_KEY),
      bucket: process.env.SUPABASE_S3_BUCKET || 'cms-media',
      collections: { media: true },
      config: {
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.SUPABASE_S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.SUPABASE_S3_REGION || 'local',
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
        return collectionSlug === 'posts'
          ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/posts/${slug}`
          : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${slug}`
      },
    }),
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
