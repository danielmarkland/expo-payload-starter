import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { parseEnv } from 'node:util'
import { pathToFileURL } from 'node:url'
import { assertSHA } from './policy.mjs'

export function releaseEnvironment(branch) {
  if (branch === 'develop') return 'development'
  if (branch === 'main') return 'production'
  throw new Error('Only tracked develop/main commits may deploy')
}
export function redact(text, env) {
  let result = String(text)
  for (const [key, value] of Object.entries(env))
    if (
      /TOKEN|SECRET|PASSWORD|DATABASE.*URL|KEY/i.test(key) &&
      value?.length > 3
    )
      result = result.split(value).join('[REDACTED]')
  return result.replace(/(postgres(?:ql)?:\/\/)[^\s@]+@/g, '$1[REDACTED]@')
}
export function compatible(previous, migrationDigest) {
  return !!previous?.id && previous.migrationDigest === migrationDigest
}
export async function executeRelease(driver, context) {
  let previous
  const record = {
    sha: context.sha,
    environment: context.environment,
    migrationDigest: context.migrationDigest,
    previous: null,
    stages: [],
    status: 'running',
  }
  let activated = false
  try {
    await driver.preflight(context)
    previous = await driver.previous(context)
    record.previous = previous?.id || null
    for (const stage of ['build', 'migrate', 'publish']) {
      record[stage] = await driver[stage](context)
      record.stages.push(stage)
    }
    record.deployment = await driver.deploy(context)
    record.stages.push('deploy')
    await driver.activate(context, record.deployment)
    activated = true
    await driver.smoke(context)
    record.stages.push('smoke')
    record.status = 'passed'
    return record
  } catch (error) {
    record.status = 'failed'
    record.error = error.message
    if (activated && compatible(previous, context.migrationDigest)) {
      try {
        await driver.rollback(context, previous.id)
        record.recovery = 'previous deployment restored'
      } catch {
        record.recovery = 'rollback failed; operator recovery required'
      }
    } else if (activated)
      record.recovery =
        'schema compatibility unknown; operator recovery required'
    throw error
  } finally {
    await driver.report(context, record)
  }
}
function migrationDigest() {
  const hash = createHash('sha256')
  for (const root of [
    'supabase/migrations',
    process.env.RELEASE_PROFILE === 'starter'
      ? 'apps/site/src/migrations'
      : 'apps/web/src/migrations',
  ]) {
    for (const file of readdirSync(root).sort()) {
      const path = join(root, file)
      if (/\.(sql|ts)$/.test(file)) hash.update(path).update(readFileSync(path))
    }
  }
  return hash.digest('hex')
}
function required(env, name) {
  if (!env[name]?.trim() || env[name] === '[SENSITIVE]')
    throw new Error(
      `Configure ${name} in this environment before enabling release automation`,
    )
  return env[name]
}
function smokeTargets(value) {
  const entries = JSON.parse(value)
  if (!Array.isArray(entries) || entries.length === 0)
    throw new Error('Configure explicit hosted smoke targets')
  for (const entry of entries) {
    const url = new URL(entry.url)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !entry.contains ||
      !Number.isInteger(entry.status)
    )
      throw new Error(
        'Smoke targets require credential-free HTTPS URL, expected status and body marker',
      )
    for (const key of Object.keys(entry.headers || {}))
      if (key.toLowerCase() !== 'x-groovepost-tenant')
        throw new Error('Smoke targets cannot carry credentials')
  }
  return entries
}
export function createDriver(env = process.env) {
  const command = (name, args, overrides = {}, capture = false) => {
    try {
      const output = execFileSync(name, args, {
        env: { ...env, ...overrides },
        encoding: 'utf8',
        maxBuffer: 128 * 1024 * 1024,
      })
      if (!capture) process.stdout.write(redact(output, env))
      return output
    } catch (error) {
      process.stderr.write(redact(error.stdout || '', env))
      process.stderr.write(redact(error.stderr || '', env))
      throw new Error(`${name} failed; release stopped`)
    }
  }
  const vercel = (...args) =>
    command('vercel', [...args, '--token', env.VERCEL_TOKEN], {}, true)
  const api = async (path) => {
    const response = await fetch(
      `https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${encodeURIComponent(env.VERCEL_ORG_ID)}`,
      {
        headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
        signal: AbortSignal.timeout(30000),
      },
    )
    if (!response.ok)
      throw new Error(`Deployment API returned ${response.status}`)
    return response.json()
  }
  const setup = async (context) => {
    for (const key of [
      'VERCEL_TOKEN',
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID',
      'DATABASE_MIGRATION_URL',
      'RELEASE_SMOKE_TARGETS',
    ])
      required(env, key)
    context.smokeTargets = smokeTargets(env.RELEASE_SMOKE_TARGETS)
    if (!['platform', 'starter'].includes(env.RELEASE_PROFILE))
      throw new Error('Invalid release profile')
    mkdirSync('.vercel', { recursive: true })
    writeFileSync(
      '.vercel/project.json',
      JSON.stringify({
        orgId: env.VERCEL_ORG_ID,
        projectId: env.VERCEL_PROJECT_ID,
      }),
    )
    const project = await api(
      `/v9/projects/${encodeURIComponent(env.VERCEL_PROJECT_ID)}`,
    )
    const expectedBranch =
      context.environment === 'development' ? 'develop' : 'main'
    if (project.link?.productionBranch !== expectedBranch)
      throw new Error(
        'Vercel project does not match the tracked environment branch',
      )
    vercel(
      'pull',
      '--yes',
      '--environment',
      'production',
      '--git-branch',
      expectedBranch,
    )
    const pulled = parseEnv(
      readFileSync('.vercel/.env.production.local', 'utf8'),
    )
    for (const [key, value] of Object.entries(pulled))
      if (
        !/^(GITHUB_|RELEASE_|NODE_AUTH_TOKEN$|INSTALL_TOKEN$|GH_TOKEN$|DATABASE_MIGRATION_URL$|VERCEL_(TOKEN|ORG_ID|PROJECT_ID)$)/.test(
          key,
        )
      )
        env[key] = value
    if (
      env.RELEASE_PROFILE === 'platform' &&
      env.GROOVEPOST_ENVIRONMENT !== context.environment
    )
      throw new Error(
        'Pulled runtime settings belong to a different environment',
      )
    env.GROOVEPOST_SITE_TRANSFER_PREPARE = 'false'
    env.VERCEL_GIT_COMMIT_SHA = context.sha
    env.VERCEL_GIT_COMMIT_REF = expectedBranch
  }
  return {
    preflight: setup,
    async previous() {
      const data = await api(
        `/v9/projects/${encodeURIComponent(env.VERCEL_PROJECT_ID)}`,
      )
      const target = data.targets?.production
      if (!target?.id) return null
      const previous = await api(`/v13/deployments/${target.id}`)
      return {
        id: previous.id,
        migrationDigest: previous.meta?.releaseMigrationDigest,
      }
    },
    async build() {
      vercel('build', '--prod')
      return 'passed'
    },
    async migrate() {
      command('supabase', [
        'db',
        'push',
        '--db-url',
        env.DATABASE_MIGRATION_URL,
        '--yes',
      ])
      const overrides = {
        DATABASE_URL: env.DATABASE_MIGRATION_URL,
        PAYLOAD_MIGRATING: 'true',
        RELEASE_MIGRATION: 'true',
      }
      if (env.RELEASE_PROFILE === 'platform')
        command(
          'pnpm',
          ['--filter', '@groovepost/web', 'release:prepare'],
          overrides,
        )
      else command('pnpm', ['payload:migrate'], overrides)
      return {
        supabase: readdirSync('supabase/migrations')
          .filter((x) => x.endsWith('.sql'))
          .sort(),
        payload: readdirSync(
          env.RELEASE_PROFILE === 'platform'
            ? 'apps/web/src/migrations'
            : 'apps/site/src/migrations',
        )
          .filter((x) => x.endsWith('.ts'))
          .sort(),
      }
    },
    async publish(context) {
      command('node', ['scripts/release/packages.mjs'])
      if (context.environment !== 'production')
        return JSON.parse(readFileSync('release-output/packages.json', 'utf8'))
      // Publish with this repository's write token, keeping registry installation credentials separate.
      const publicationConfig = join(process.cwd(), '.vercel/publication.npmrc')
      writeFileSync(
        publicationConfig,
        '@groovepost:registry=https://npm.pkg.github.com\n@danielmarkland:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}\n',
      )
      const publicationEnvironment = {
        npm_config_userconfig: publicationConfig,
        NPM_CONFIG_USERCONFIG: publicationConfig,
      }
      if (env.RELEASE_PROFILE === 'platform')
        command(
          'node',
          ['scripts/publish-developer-packages.mjs'],
          publicationEnvironment,
        )
      else
        command(
          'pnpm',
          ['exec', 'changeset', 'publish'],
          publicationEnvironment,
        )
      command('node', ['scripts/release/packages.mjs', '--clean-install'])
      return JSON.parse(readFileSync('release-output/packages.json', 'utf8'))
    },
    async deploy(context) {
      const output = vercel(
        'deploy',
        '--prebuilt',
        '--prod',
        '--skip-domain',
        '--yes',
        '--meta',
        `releaseSha=${context.sha}`,
        '--meta',
        `releaseMigrationDigest=${context.migrationDigest}`,
      )
      const url = output
        .trim()
        .split('\n')
        .findLast((x) => /^https:\/\/[a-zA-Z0-9.-]+\.vercel\.app$/.test(x))
      if (!url)
        throw new Error(
          'Deployment command did not return an immutable deployment URL',
        )
      const deployment = await api(
        `/v13/deployments/${encodeURIComponent(new URL(url).hostname)}`,
      )
      if (
        deployment.meta?.releaseSha !== context.sha ||
        deployment.meta?.releaseMigrationDigest !== context.migrationDigest
      )
        throw new Error(
          'Deployment identity/evidence does not match the release',
        )
      return { id: deployment.id, url }
    },
    async activate(_context, deployment) {
      vercel('promote', deployment.url, '--yes')
    },
    async smoke(context) {
      for (const target of context.smokeTargets) {
        let passed = false
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch(target.url, {
              headers: target.headers,
              redirect: 'manual',
              signal: AbortSignal.timeout(15000),
            })
            if (
              response.status === target.status &&
              (await response.text()).includes(target.contains)
            ) {
              passed = true
              break
            }
          } catch {
            /* A bounded retry covers deployment propagation. */
          }
          if (attempt < 2)
            await new Promise((resolve) => setTimeout(resolve, 3000))
        }
        if (!passed)
          throw new Error(
            `Hosted smoke failed for ${new URL(target.url).hostname}${new URL(target.url).pathname}`,
          )
      }
    },
    async rollback(_context, id) {
      vercel('rollback', id, '--yes')
    },
    async report(_context, record) {
      const safe = redact(JSON.stringify(record, null, 2), env)
      mkdirSync('release-output', { recursive: true })
      writeFileSync('release-output/result.json', safe)
      if (env.GITHUB_STEP_SUMMARY)
        writeFileSync(
          env.GITHUB_STEP_SUMMARY,
          `## Release result\n\n\`\`\`json\n${safe}\n\`\`\`\n`,
          { flag: 'a' },
        )
    },
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const environment = releaseEnvironment(process.env.GITHUB_REF_NAME)
    const sha = assertSHA(process.env.GITHUB_SHA)
    if (
      execFileSync('git', ['rev-parse', 'HEAD'], {
        encoding: 'utf8',
      }).trim() !== sha
    )
      throw new Error('Checkout must match the exact tracked commit')
    await executeRelease(createDriver(), {
      environment,
      sha,
      migrationDigest: migrationDigest(),
    })
  } catch (error) {
    console.error(redact(error.message, process.env))
    process.exitCode = 1
  }
}
