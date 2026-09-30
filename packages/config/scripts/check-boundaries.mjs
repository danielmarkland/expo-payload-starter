import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const allowedDependencies = {
  '@starter/api-client': new Set(['@danielmarkland/contracts', 'zod']),
  '@starter/auth': new Set(['@starter/core']),
  '@starter/core': new Set(['@danielmarkland/contracts']),
  '@starter/data': new Set([
    '@danielmarkland/contracts',
    '@supabase/supabase-js',
  ]),
}

const packageDirectories = {
  'api-client': '@starter/api-client',
  auth: '@starter/auth',
  core: '@starter/core',
  data: '@starter/data',
}
const importPattern = /(?:from\s+|import\s*\()['"]([^'"./][^'"]*)['"]/g
const errors = []

for (const [directory, packageName] of Object.entries(packageDirectories)) {
  const files = await sourceFiles(join('packages', directory, 'src'))
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    for (const match of source.matchAll(importPattern)) {
      const dependency = match[1].startsWith('@')
        ? match[1].split('/').slice(0, 2).join('/')
        : match[1].split('/')[0]
      if (
        !allowedDependencies[packageName].has(dependency) &&
        dependency !== 'vitest'
      ) {
        errors.push(`${file}: ${packageName} cannot import ${dependency}`)
      }
    }
  }
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

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return entries.flatMap((entry) =>
    entry.isDirectory()
      ? []
      : entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')
        ? [join(directory, entry.name)]
        : [],
  )
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
