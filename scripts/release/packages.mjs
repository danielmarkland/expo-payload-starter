import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

function canonicalJSON(value) {
  if (Array.isArray(value)) return value.map(canonicalJSON)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalJSON(value[key])]),
    )
  return value
}
export function archiveDigest(path) {
  const names = execFileSync('tar', ['-tf', path], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter((x) => x && !x.endsWith('/'))
    .sort()
  const modes = execFileSync('tar', ['-tvf', path], { encoding: 'utf8' }).split(
    '\n',
  )
  if (modes.some((x) => /^[lhbcps]/.test(x)))
    throw new Error('Package archive contains links')
  for (const entry of execFileSync('tar', ['-tf', path], { encoding: 'utf8' })
    .trim()
    .split('\n')) {
    if (!entry.startsWith('package/') || entry.split('/').includes('..'))
      throw new Error('Unsafe package archive entry')
  }
  const hash = createHash('sha256')
  for (const name of names) {
    if (
      !name.startsWith('package/') ||
      name.split('/').some((x) => x === '..') ||
      name.includes('\0')
    )
      throw new Error('Unsafe package archive path')
  }
  if (new Set(names).size !== names.length)
    throw new Error('Duplicate package archive path')
  const temp = mkdtempSync(join(tmpdir(), 'package-digest-'))
  try {
    execFileSync('tar', ['-xf', path, '-C', temp])
    for (const name of names) {
      let bytes = readFileSync(join(temp, name))
      // Manifest serialization differs between packing tools; values remain immutable.
      if (name === 'package/package.json')
        bytes = Buffer.from(JSON.stringify(canonicalJSON(JSON.parse(bytes))))
      hash.update(JSON.stringify([name, bytes.length])).update(bytes)
    }
    return hash.digest('hex')
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}

export function compareVersion(local, published, label) {
  if (local !== published)
    throw new Error(
      `${label} already exists with different packed contents; bump the package version`,
    )
}
export function publicDirectories(root = 'packages') {
  return readdirSync(root)
    .filter(
      (directory) =>
        existsSync(join(root, directory, 'package.json')) &&
        !JSON.parse(readFileSync(join(root, directory, 'package.json')))
          .private,
    )
    .map((directory) => join(root, directory))
}
export function verifyPackages(
  directories = publicDirectories(),
  run = execFileSync,
) {
  const report = []
  for (const directory of directories) {
    const manifest = JSON.parse(readFileSync(join(directory, 'package.json')))
    const label = `${manifest.name}@${manifest.version}`
    let published
    try {
      published = JSON.parse(
        run('pnpm', ['view', label, 'version', '--json'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        }),
      )
    } catch (error) {
      const text = `${error.stdout || ''}${error.stderr || ''}`
      if (!/ERR_PNPM_FETCH_404|No matching version found/.test(text))
        throw new Error(
          `Cannot inspect ${label}; registry authentication/network failure is not a missing version`,
        )
    }
    const temp = mkdtempSync(join(tmpdir(), 'release-package-'))
    try {
      run('pnpm', ['pack', '--pack-destination', temp], {
        cwd: resolve(directory),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      const local = join(
        temp,
        readdirSync(temp).find((x) => x.endsWith('.tgz')),
      )
      const digest = archiveDigest(local)
      if (published) {
        const downloaded = JSON.parse(
          run(
            'npm',
            [
              'pack',
              label,
              '--ignore-scripts',
              '--pack-destination',
              temp,
              '--json',
            ],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
          ),
        )
        const archive = join(temp, downloaded[0].filename)
        // npm may use the same filename as pnpm; compute the local digest before downloading.
        compareVersion(digest, archiveDigest(archive), label)
      }
      report.push({
        name: manifest.name,
        version: manifest.version,
        digest,
        published: !!published,
      })
    } finally {
      rmSync(temp, { recursive: true, force: true })
    }
  }
  return report
}
export function verifyCleanInstall(report, run = execFileSync) {
  if (report.some((entry) => !entry.published))
    throw new Error('Publication incomplete; refusing deployment')
  const temp = mkdtempSync(join(tmpdir(), 'release-consumer-'))
  try {
    writeFileSync(
      join(temp, '.npmrc'),
      '@groovepost:registry=https://npm.pkg.github.com\n@danielmarkland:registry=https://npm.pkg.github.com\n',
    )
    writeFileSync(
      join(temp, 'package.json'),
      JSON.stringify({
        name: 'release-consumer',
        private: true,
        type: 'module',
      }),
    )
    run(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        ...report.map((entry) => `${entry.name}@${entry.version}`),
      ],
      { cwd: temp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
    for (const entry of report) {
      const manifest = JSON.parse(
        readFileSync(join(temp, 'node_modules', entry.name, 'package.json')),
      )
      if (manifest.version !== entry.version)
        throw new Error(
          `Clean consumer installed unexpected ${entry.name} version`,
        )
    }
    return report
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const report = verifyPackages()
    if (process.argv.includes('--clean-install')) verifyCleanInstall(report)
    mkdirSync('release-output', { recursive: true })
    writeFileSync(
      'release-output/packages.json',
      JSON.stringify(report, null, 2),
    )
    for (const entry of report)
      console.info(
        `${entry.name}@${entry.version}: ${entry.published ? 'existing immutable contents verified' : 'new version ready'}`,
      )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
