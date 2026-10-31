import {
  releaseTarget,
  assertDevDomain,
  assertDevSmokeTargets,
  assertDeploymentTarget,
} from './target.mjs'
import { execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
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
    activated = true // Recovery also covers partial promotion failures.
    await driver.activate(context, record.deployment)
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
    'database/migrations',
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
  let candidate
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
  const api = async (path, method = 'GET', body) => {
    const response = await fetch(
      `https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${encodeURIComponent(env.VERCEL_ORG_ID)}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(30000),
      },
    )
    if (!response.ok)
      throw Object.assign(
        new Error(`Deployment API returned ${response.status}`),
        { status: response.status },
      )
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
    context.target = releaseTarget(context.environment, env.RELEASE_PROFILE)
    context.project = project
    if (context.target === 'dev') {
      const custom = (project.customEnvironments || []).find(
        (e) => e.slug === 'dev',
      )
      if (
        !custom ||
        custom.branchMatcher?.type !== 'equals' ||
        custom.branchMatcher.pattern !== 'develop'
      )
        throw new Error('Custom dev environment must track develop')
      if (project.link?.productionBranch !== 'main')
        throw new Error('Consolidated project must track main for production')
      context.customEnvironmentId = custom.id
      const domains = await api(
        `/v9/projects/${encodeURIComponent(env.VERCEL_PROJECT_ID)}/domains?limit=100`,
      )
      if (domains.pagination?.next)
        throw new Error(
          'Domain inventory requires pagination before activation',
        )
      context.devDomains = domains.domains.filter(
        (d) => d.customEnvironmentId === custom.id,
      )
      if (!context.devDomains.length)
        throw new Error('Custom dev has no assigned domains')
      for (const d of context.devDomains) assertDevDomain(d, custom.id)
      assertDevSmokeTargets(context.smokeTargets, context.devDomains)
    }
    if (
      context.target !== 'dev' &&
      project.link?.productionBranch !== expectedBranch
    )
      throw new Error(
        'Vercel project does not match the tracked environment branch',
      )
    vercel('pull', '--yes', '--environment', context.target)
    const pulled = parseEnv(
      readFileSync(`.vercel/.env.${context.target}.local`, 'utf8'),
    )
    for (const [key, value] of Object.entries(pulled))
      if (
        !/^(GITHUB_|RELEASE_|NODE_AUTH_TOKEN$|INSTALL_TOKEN$|GH_TOKEN$|DATABASE_MIGRATION_URL$|VERCEL_(TOKEN|ORG_ID|PROJECT_ID)$)/.test(
          key,
        )
      )
        if (value !== '[SENSITIVE]') env[key] = value
    if (
      env.RELEASE_PROFILE === 'platform' &&
      env.GROOVEPOST_ENVIRONMENT !== context.environment
    )
      throw new Error(
        'Pulled runtime settings belong to a different environment',
      )
    // Used only to initialize the migration process; never changes hosted sessions.
    env.PAYLOAD_SECRET = randomBytes(32).toString('hex')
    if (env.RELEASE_PROFILE === 'platform')
      env.GROOVEPOST_SITE_TRANSFER_PREPARE = 'false'
    env.VERCEL_GIT_COMMIT_SHA = context.sha
    env.VERCEL_GIT_COMMIT_REF = expectedBranch
  }
  return {
    preflight: setup,
    async previous(context) {
      let id
      if (context.target === 'dev') {
        const ids = new Set()
        for (const domain of context.devDomains) {
          const alias = await api(
            `/v4/aliases/${encodeURIComponent(domain.name)}`,
          )
          if (alias.deploymentId) ids.add(alias.deploymentId)
        }
        if (!ids.size) return null
        if (ids.size !== 1)
          throw new Error(
            'Dev aliases do not have a single recoverable deployment',
          )
        id = [...ids][0]
      } else {
        const data = await api(
          `/v9/projects/${encodeURIComponent(env.VERCEL_PROJECT_ID)}`,
        )
        id = data.targets?.production?.id
      }
      if (!id) return null
      const previous = await api(`/v13/deployments/${id}`)
      assertDeploymentTarget(previous, context)
      return {
        id: previous.id,
        migrationDigest: previous.meta?.releaseMigrationDigest,
      }
    },
    async build(context) {
      // Migration imports and registry guards need local compiled packages too.
      command('pnpm', ['--filter', './packages/**', 'build'])
      if (context.target === 'dev') {
        // Custom environments auto-activate domains. Build the exact SHA in
        // Preview first; a SHA ref cannot match the custom develop matcher.
        const deployment = await api('/v13/deployments', 'POST', {
          name: context.project.name,
          project: env.VERCEL_PROJECT_ID,
          gitSource: {
            type: 'github',
            repoId: context.project.link.repoId,
            ref: context.sha,
            sha: context.sha,
          },
          meta: {
            releaseSha: context.sha,
            releaseMigrationDigest: context.migrationDigest,
          },
        })
        const deadline = Date.now() + 20 * 60 * 1000
        let ready = deployment
        while (
          !['READY', 'ERROR', 'CANCELED'].includes(ready.readyState) &&
          Date.now() < deadline
        ) {
          await new Promise((resolve) => setTimeout(resolve, 10000))
          ready = await api(`/v13/deployments/${deployment.id}`)
        }
        if (ready.readyState !== 'READY')
          throw new Error('Dev candidate build failed or timed out')
        if (ready.customEnvironment || ready.target === 'production')
          throw new Error(
            'Dev candidate must be an unassigned Preview deployment',
          )
        candidate = { url: 'https://' + ready.url }
        return candidate
      }
      const output = vercel(
        'deploy',
        '--prod',
        '--skip-domain',
        '--yes',
        '--build-env',
        'GROOVEPOST_SITE_TRANSFER_PREPARE=false',
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
          'Cloud build did not return an immutable deployment URL',
        )
      candidate = { url }
      return 'cloud build passed; traffic unchanged'
    },
    async migrate() {
      command('node', ['scripts/database/migrate.mjs'])
      const overrides = {
        DATABASE_URL: env.DATABASE_MIGRATION_URL,
        PAYLOAD_MIGRATING: 'true',
        RELEASE_MIGRATION: 'true',
        VERCEL: '0',
      }
      if (env.RELEASE_PROFILE === 'platform')
        command(
          'pnpm',
          ['--filter', '@groovepost/web', 'release:prepare'],
          overrides,
        )
      else command('pnpm', ['payload:migrate'], overrides)
      return {
        postgres: readdirSync('database/migrations')
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
      if (!candidate?.url)
        throw new Error('No completed cloud build for this release')
      const { url } = candidate
      const deployment = await api(
        `/v13/deployments/${encodeURIComponent(new URL(url).hostname)}`,
      )
      if (
        deployment.readyState !== 'READY' ||
        deployment.meta?.releaseSha !== context.sha ||
        deployment.meta?.releaseMigrationDigest !== context.migrationDigest
      )
        throw new Error(
          'Deployment identity/evidence does not match the release',
        )
      if (context.target === 'dev') {
        if (deployment.customEnvironment || deployment.target === 'production')
          throw new Error(
            'Dev candidate must be an unassigned Preview deployment',
          )
      } else assertDeploymentTarget(deployment, context)
      return { id: deployment.id, url }
    },
    async activate(context, deployment) {
      if (context.target !== 'dev') {
        vercel('promote', deployment.url, '--yes')
        return
      }
      for (const domain of context.devDomains) {
        const current = await api(
          `/v9/projects/${encodeURIComponent(env.VERCEL_PROJECT_ID)}/domains/${encodeURIComponent(domain.name)}`,
        )
        assertDevDomain(current, context.customEnvironmentId)
      }
      // This phase runs only after migrations, and the pipeline marks activation
      // started before calling it so failures can restore compatible dev aliases.
      // Vercel rebuilds the validated SHA using custom-dev runtime settings.
      // Exact refs avoid the tracked-branch ignore rule; Vercel ignored both
      // null and explicit per-deployment ignore-command overrides in tests.
      const created = await api('/v13/deployments', 'POST', {
        name: context.project.name,
        project: env.VERCEL_PROJECT_ID,
        customEnvironmentSlugOrId: context.customEnvironmentId,
        gitSource: {
          type: 'github',
          repoId: context.project.link.repoId,
          ref: context.sha,
          sha: context.sha,
        },
        meta: {
          releaseSha: context.sha,
          releaseMigrationDigest: context.migrationDigest,
        },
      })
      const deadline = Date.now() + 20 * 60 * 1000
      let ready = created
      while (
        !['READY', 'ERROR', 'CANCELED'].includes(ready.readyState) &&
        Date.now() < deadline
      ) {
        await new Promise((resolve) => setTimeout(resolve, 10000))
        ready = await api(`/v13/deployments/${created.id}`)
      }
      if (ready.readyState !== 'READY')
        throw new Error('Custom dev activation failed or timed out')
      assertDeploymentTarget(ready, context)
      if (
        ready.meta?.releaseSha !== context.sha ||
        ready.meta?.releaseMigrationDigest !== context.migrationDigest
      )
        throw new Error(
          'Custom dev activation evidence does not match the release',
        )
      deployment.id = ready.id
      deployment.url = 'https://' + ready.url
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
    async rollback(context, id) {
      if (context.target !== 'dev') {
        vercel('rollback', id, '--yes')
        return
      }
      const deployment = await api(`/v13/deployments/${id}`)
      assertDeploymentTarget(deployment, context)
      for (const domain of context.devDomains) {
        const current = await api(
          `/v9/projects/${encodeURIComponent(env.VERCEL_PROJECT_ID)}/domains/${encodeURIComponent(domain.name)}`,
        )
        assertDevDomain(current, context.customEnvironmentId)
        vercel('alias', 'set', deployment.url, domain.name)
      }
    },
    async report(_context, record) {
      if (env.GITHUB_ACTIONS === 'true')
        record.checks = {
          sourceSHA: record.sha,
          runId: env.GITHUB_RUN_ID,
          workflow: env.GITHUB_WORKFLOW,
          validation: 'required validate job passed',
        }
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
