import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const allowedDependencies = {
  '@starter/auth': new Set(['@starter/core']),
  '@starter/core': new Set(['@starter/contracts']),
  '@starter/data': new Set(['@starter/contracts', '@supabase/supabase-js']),
}

const packageDirectories = {
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
