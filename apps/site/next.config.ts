import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { existsSync } from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
// Payload form providers and shared controls must use one React context instance.
const require = createRequire(import.meta.url)
const payloadRequire = createRequire(require.resolve('@payloadcms/next/withPayload'))
let payloadUI = path.dirname(payloadRequire.resolve('@payloadcms/ui'))
while (!existsSync(path.join(payloadUI, 'package.json'))) {
  payloadUI = path.dirname(payloadUI)
}
const payloadUIAlias = `./${path.relative(dirname, payloadUI).split(path.sep).join('/')}`

const nextConfig: NextConfig = {
  transpilePackages: ['@danielmarkland/publishing-ui'],
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
      '@payloadcms/ui': payloadUIAlias,
      '@payloadcms/ui/*': `${payloadUIAlias}/*`,
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
