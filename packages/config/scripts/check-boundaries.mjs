import { checkPackage } from './package-boundaries.mjs'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const allowedDependencies = {
  '@danielmarkland/publishing-ui': new Set([
    '@danielmarkland/publishing-contracts',
    'react',
    'react-dom',
    'next',
    'lucide-react',
    'payload',
    '@payloadcms/ui',
    '@testing-library/react',
  ]),
  '@starter/api-client': new Set([
    '@danielmarkland/contracts',
    '@danielmarkland/publishing-contracts',
    'zod',
  ]),
  '@starter/auth': new Set(['@starter/core']),
  '@starter/core': new Set(['@danielmarkland/contracts']),
  '@starter/data': new Set([
    '@danielmarkland/contracts',
    '@supabase/supabase-js',
  ]),
  '@danielmarkland/publishing-core': new Set([
    '@danielmarkland/design-tokens',
    '@payloadcms/richtext-lexical',
    'payload',
  ]),
}

const errors = []
for (const directory of await readdir('packages')) {
  let manifest
  try {
    manifest = JSON.parse(
      await readFile(join('packages', directory, 'package.json'), 'utf8'),
    )
  } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }
  if (directory === 'config') continue
  errors.push(
    ...(await checkPackage(join('packages', directory), {
      allowed: allowedDependencies[manifest.name],
      published: manifest.private === false,
    })),
  )
}

for (const file of await recursiveSourceFiles(join('apps', 'app'))) {
  const source = await readFile(file, 'utf8')
  if (
    source.includes('@starter/data') ||
    /\.from\(['"][^'"]+['"]\)/.test(source)
  ) {
    errors.push(`${file}: Expo product data must use @starter/api-client`)
  }
}

for (const file of await recursiveSourceFiles(join('apps', 'site', 'src'))) {
  if (
    file.endsWith(join('lib', 'api', 'services.ts')) ||
    file.includes(`${join('src', 'scripts')}/`)
  ) {
    continue
  }
  const source = await readFile(file, 'utf8')
  if (source.includes("from 'payload'") && source.includes('getPayload')) {
    errors.push(`${file}: website content and product data must use the BFF`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Package boundaries are valid.')
}

async function recursiveSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return recursiveSourceFiles(path)
      return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')
        ? [path]
        : []
    }),
  )
  return files.flat()
}
