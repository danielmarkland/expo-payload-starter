import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
// Payload form providers and shared controls must use one React context instance.
const payloadUI = path.resolve(dirname, 'node_modules/@payloadcms/ui')

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@payloadcms/ui': payloadUI,
    }
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname, '../..'),
    resolveAlias: {
      '@payloadcms/ui': './node_modules/@payloadcms/ui',
      '@payloadcms/ui/*': './node_modules/@payloadcms/ui/*',
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
