#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  readFileSync,
  mkdirSync,
  chmodSync,
  openSync,
  writeFileSync,
  closeSync,
  unlinkSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import {
  buckets,
  choices,
  secret,
  origin,
  privateWrite,
  writeManagedEnv,
  freePort,
  runtimeSettings,
} from './setup-lib.mjs'

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)))
const args = process.argv.slice(2)
const option = (name) => {
  const i = args.indexOf(`--${name}`)
  return i < 0 ? undefined : args[i + 1]
}
let stage = 'prepare'
function run(command, argv, { env = {}, input, visible = false } = {}) {
  const result = spawnSync(command, argv, {
    cwd: root,
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
    maxBuffer: 32e6,
    timeout: 20 * 60 * 1000,
    stdio: visible ? 'inherit' : 'pipe',
  })
  if (result.status !== 0)
    throw Error(
      `${command} failed during ${stage}; output withheld to protect credentials`,
    )
  return result.stdout?.trim()
}
const json = (value) => {
  const response = JSON.parse(value)
  return response.data || response
}
const neon = (argv) => json(run('neon', [...argv, '--output', 'json']))
const vercel = (path, method = 'GET', body) =>
  json(
    run(
      'vercel',
      [
        'api',
        path,
        ...(method !== 'GET' ? ['--method', method] : []),
        ...(body ? ['--input', '-'] : []),
      ],
      { input: body ? JSON.stringify(body) : undefined },
    ),
  )
const folder = join(root, '.starter')
const statePath = join(folder, 'state.json')
let state
const save = () =>
  privateWrite(statePath, JSON.stringify(state, null, 2) + '\n')
// Journal non-idempotent provider requests. Unknown outcomes require reconciliation,
// never blindly create a second project or rotate a one-time credential.
function once(key, action) {
  if (state[key]) return state[key]
  if (state.pending)
    throw Error(
      'A previous provider operation has an unknown outcome; inspect .starter/state.json before retrying',
    )
  state.pending = key
  save()
  const value = action()
  state[key] = value
  delete state.pending
  save()
  return value
}
async function main() {
  if (args.includes('--help')) {
    console.log(
      'pnpm run setup [--mode local|hosted] [--name project] [--email admin@example.com] [--site-url origin]\nLocal: mode, project name, administrator email. Hosted: mode, project name, organization (if multiple); uses signed-in account email. Prerequisites: Node 22+, pnpm 11, Docker (local), signed-in Neon and Vercel CLIs (hosted).\n--configure-only skips initialization/deployment. --environment production creates a separate hosted installation. Never use tests against hosted data.',
    )
    return
  }
  mkdirSync(folder, { recursive: true, mode: 0o700 })
  chmodSync(folder, 0o700)
  const lockPath = join(folder, 'setup.lock')
  if (existsSync(lockPath)) {
    const pid = Number(readFileSync(lockPath, 'utf8'))
    if (!Number.isSafeInteger(pid) || pid <= 0)
      throw Error('Setup lock needs explicit operator reconciliation')
    try {
      process.kill(pid, 0)
      throw Error('Another setup is running for this checkout')
    } catch (error) {
      if (error.code !== 'ESRCH') throw error
    }
    unlinkSync(lockPath)
  }
  const lock = openSync(lockPath, 'wx', 0o600)
  writeFileSync(lock, String(process.pid))
  closeSync(lock)
  process.once('exit', () => {
    if (
      existsSync(lockPath) &&
      readFileSync(lockPath, 'utf8') === String(process.pid)
    )
      unlinkSync(lockPath)
  })
  process.once('SIGINT', () => process.exit(130))
  process.once('SIGTERM', () => process.exit(143))
  if (existsSync(statePath)) {
    state = JSON.parse(readFileSync(statePath, 'utf8'))
    for (const key of ['mode', 'name', 'email'])
      if (option(key) && option(key) !== state[key])
        throw Error(
          'This checkout already belongs to a different setup; use a separate checkout',
        )
    if (option('site-url') && option('site-url') !== state.siteURL)
      throw Error(
        'Existing site URL is preserved; domain changes need deliberate configuration',
      )
    if (option('neon-org') && option('neon-org') !== state.neonOrg)
      throw Error('Hosting organization changes require a separate checkout')
    if (option('environment') && option('environment') !== state.environment)
      throw Error('Environment changes require a separate checkout')
    if (state.pending)
      throw Error(
        'Previous provider operation has an unknown outcome; reconcile .starter/state.json before retrying',
      )
  } else {
    // Avoid replacing a pre-existing installation with freshly generated signing keys.
    for (const file of [
      '.env',
      'apps/site/.env',
      'apps/site/.env.local',
      'apps/app/.env',
      'apps/app/.env.local',
      '.vercel/project.json',
    ])
      if (existsSync(join(root, file)))
        throw Error(`Existing ${file}; use advanced setup or a fresh checkout`)
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    const answer = async (name, question, fallback) => {
      if (option(name)) return option(name)
      if (!process.stdin.isTTY)
        throw Error(`--${name} required without an interactive terminal`)
      return (await rl.question(question)).trim() || fallback
    }
    try {
      const mode = await answer(
        'mode',
        'Run locally or hosted? [local] ',
        'local',
      )
      const name = await answer('name', 'Project name: ')
      let email, neonOrg
      if (mode === 'hosted') {
        stage =
          'hosting account (sign in with neon login and vercel login first)'
        const account = neon(['me'])
        vercel('/v2/user')
        const organizations =
          neon(['api', '/users/me/organizations']).organizations || []
        neonOrg =
          option('neon-org') ||
          (organizations.length === 1 ? organizations[0].id : undefined)
        if (!neonOrg) {
          if (!process.stdin.isTTY)
            throw Error(
              '--neon-org required when the account has multiple organizations',
            )
          console.log(
            organizations
              .map((item, index) => `${index + 1}. ${item.name}`)
              .join('\n'),
          )
          const selected = Number(await rl.question('Hosting organization: '))
          neonOrg = organizations[selected - 1]?.id
        }
        if (!organizations.some((item) => item.id === neonOrg))
          throw Error('Choose an available hosting organization')
        email = option('email') || account.email
      } else email = await answer('email', 'Administrator email: ')

      state = {
        ...choices({ mode, name, email }),
        environment: option('environment') || 'development',
        ...(neonOrg ? { neonOrg } : {}),
        payloadSecret: secret(),
        authSecret: secret(),
        adminPassword: secret(),
      }
      if (!['development', 'production'].includes(state.environment))
        throw Error('Environment must be development or production')
      if (mode === 'local' && state.environment !== 'development')
        throw Error('Local containers are development only')
      save()
    } finally {
      rl.close()
    }
  }
  stage = 'dependencies'
  console.log('Installing locked dependencies…')
  run('pnpm', ['install', '--frozen-lockfile'], { visible: true })
  const require = createRequire(join(root, 'apps/app/app.config.js'))
  const scheme = require(join(root, 'apps/app/app.config.js')).scheme
  if (state.mode === 'local') {
    if (!state.ports) {
      state.composeProject = `${state.name}-${createHash('sha256').update(root).digest('hex').slice(0, 8)}`
      state.ports = {
        database: await freePort(55432),
        storage: await freePort(59000),
        site: await freePort(3000),
        app: await freePort(8081),
      }
      state.siteURL = origin(
        option('site-url') || `http://localhost:${state.ports.site}`,
        true,
      )
      state.ports.site = Number(new URL(state.siteURL).port || 80)
      state.ownerPassword = secret()
      state.runtimePassword = secret()
      state.migrationDatabase = `postgresql://postgres:${state.ownerPassword}@127.0.0.1:${state.ports.database}/starter`
      state.database = `postgresql://starter_runtime:${state.runtimePassword}@127.0.0.1:${state.ports.database}/starter`
      state.storage = {
        accessKey: secret(),
        secretKey: secret(),
        endpoint: `http://127.0.0.1:${state.ports.storage}`,
        region: 'us-east-1',
      }
      save()
    }
    writeManagedEnv(root, state, '.env', {
      LOCAL_POSTGRES_PASSWORD: state.ownerPassword,
      LOCAL_S3_ACCESS_KEY_ID: state.storage.accessKey,
      LOCAL_S3_SECRET_ACCESS_KEY: state.storage.secretKey,
      LOCAL_POSTGRES_PORT: state.ports.database,
      LOCAL_STORAGE_PORT: state.ports.storage,
    })
    save()
    stage = 'local containers'
    console.log('Starting private local database and storage…')
    run('docker', [
      'compose',
      '--project-name',
      state.composeProject || state.name,
      'up',
      '-d',
      '--wait',
      '--wait-timeout',
      '120',
    ])
  } else {
    stage = 'hosting account'
    vercel('/v2/user')
    neon(['me'])
    const organizations =
      neon(['api', '/users/me/organizations']).organizations || []
    const organization =
      state.neonOrg ||
      option('neon-org') ||
      (organizations.length === 1 ? organizations[0].id : undefined)
    if (
      !organization ||
      !organizations.some((item) => item.id === organization)
    )
      throw Error(
        'Choose the Neon account organization with --neon-org; multiple accounts cannot be selected implicitly',
      )
    if (
      ![
        'aws-us-east-2',
        'aws-us-east-1',
        'aws-eu-central-1',
        'aws-ap-southeast-1',
      ].includes(option('region') || 'aws-us-east-2')
    )
      throw Error('Selected region must support object storage')
    stage = 'backend project'
    const project = once('neonProject', () => {
      const value = neon([
        'api',
        '/projects',
        '--method',
        'POST',
        '--data',
        JSON.stringify({
          project: {
            name: `${state.name}-${state.environment}`,
            org_id: organization,
            region_id: option('region') || 'aws-us-east-2',
            pg_version: 17,
          },
        }),
      ])
      if (!value.project?.id || !value.branch?.id)
        throw Error('Unexpected Neon project response')
      return { id: value.project.id, branch: value.branch.id }
    })
    const scope = ['--project-id', project.id, '--branch', project.branch]
    stage = 'database connections'
    if (!state.migrationDatabase) {
      const raw = run('neon', [
        'connection-string',
        project.branch,
        '--project-id',
        project.id,
        '--ssl',
        'verify-full',
      ])
      const url = raw.startsWith('postgres') ? raw : json(raw).uri
      if (!url || new URL(url).hostname.includes('-pooler'))
        throw Error('Direct migration connection required')
      state.migrationDatabase = url
      save()
    }
    if (!state.database) {
      state.runtimePassword = secret()
      const url = new URL(state.migrationDatabase)
      if (
        !url.hostname.endsWith('.neon.tech') ||
        url.hostname.includes('-pooler')
      )
        throw Error('Expected direct Neon hostname')
      url.username = 'starter_runtime'
      url.password = state.runtimePassword
      url.hostname = url.hostname.replace('.', '-pooler.')
      state.database = url.href
      save()
    }
    stage = 'private buckets'
    for (const bucket of buckets)
      once(`bucket:${bucket}`, () => {
        neon([
          'api',
          `/projects/${project.id}/branches/${project.branch}/buckets`,
          '--method',
          'POST',
          '--data',
          JSON.stringify({ name: bucket, access_level: 'private' }),
        ])
        return true
      })
    stage = 'scoped storage credential'
    const credential = once('storageCredential', () => {
      const value = neon([
        'credentials',
        'create',
        ...scope,
        '--name',
        'starter-runtime',
        '--scope',
        'storage:read',
        '--scope',
        'storage:write',
      ])
      if (
        !value.token_id ||
        !value.s3_secret_access_key ||
        value.branch_id !== project.branch ||
        !['storage:read', 'storage:write'].every((s) =>
          value.scopes.includes(s),
        ) ||
        value.scopes.some(
          (s) =>
            !['storage:read', 'storage:write', 'telemetry:write'].includes(s),
        )
      )
        throw Error('Storage credential scope validation failed')
      return {
        accessKey: value.token_id,
        secretKey: value.s3_secret_access_key,
      }
    })
    if (!state.storage) {
      const storage = neon([
        'api',
        `/projects/${project.id}/branches/${project.branch}/storage`,
      ])
      if (!storage.enabled || !storage.s3_endpoint || !storage.region)
        throw Error('Storage endpoint unavailable')
      state.storage = {
        ...credential,
        endpoint: storage.s3_endpoint,
        region: storage.region,
      }
      save()
    }
    stage = 'hosting project'
    const hosted = once('vercelProject', () => {
      const value = vercel('/v11/projects', 'POST', {
        name: state.name,
        framework: 'nextjs',
        rootDirectory: 'apps/site',
      })
      if (!value.id || !value.accountId)
        throw Error('Unexpected Vercel project response')
      return { id: value.id, accountId: value.accountId, name: value.name }
    })
    if (!state.siteURL) {
      const response = vercel(
        `/v9/projects/${hosted.id}/domains?teamId=${hosted.accountId}`,
      )
      const domain = response.domains?.find((d) =>
        d.name.endsWith('.vercel.app'),
      )
      if (!domain) throw Error('Default hosted domain unavailable')
      state.siteURL = origin(option('site-url') || `https://${domain.name}`)
      save()
    }
    if (option('site-url')) {
      const hostname = new URL(state.siteURL).hostname
      once('customDomain', () => {
        vercel(
          `/v10/projects/${hosted.id}/domains?teamId=${hosted.accountId}`,
          'POST',
          { name: hostname },
        )
        return hostname
      })
      const domain = vercel(
        `/v9/projects/${hosted.id}/domains/${hostname}?teamId=${hosted.accountId}`,
      )
      if (!domain.verified)
        throw Error(
          'Custom domain needs DNS verification; configure provider-recommended DNS and rerun. Existing records were not changed.',
        )
    }
    privateWrite(
      join(root, '.vercel/project.json'),
      JSON.stringify({
        projectId: hosted.id,
        orgId: hosted.accountId,
        projectName: hosted.name,
      }),
    )
  }
  state.customerPassword ||= secret()
  save()
  const runtime = runtimeSettings(state, scheme)
  writeManagedEnv(root, state, 'apps/site/.env.local', runtime)
  writeManagedEnv(root, state, 'apps/app/.env.local', {
    EXPO_PUBLIC_SITE_URL: state.siteURL,
  })
  privateWrite(
    join(folder, 'release.env'),
    `DATABASE_MIGRATION_URL="${state.migrationDatabase}"\n`,
  )
  privateWrite(
    join(folder, 'administrator.json'),
    JSON.stringify(
      {
        email: state.email,
        password: state.adminPassword,
        loginURL: `${state.siteURL}/admin/login`,
        customerPassword: state.customerPassword,
      },
      null,
      2,
    ) + '\n',
  )
  save()
  if (args.includes('--configure-only')) {
    console.log(
      'Configuration saved privately; initialization and deployment skipped. Run pnpm run setup again to finish.',
    )
    return
  }
  stage = 'shared packages'
  console.log('Building shared packages…')
  run('pnpm', ['exec', 'turbo', 'run', 'build', '--filter=./packages/*'])
  stage = 'database migrations'
  console.log('Applying application and CMS migrations…')
  const ownerEnv = {
    ...runtime,
    DATABASE_URL: state.migrationDatabase,
    DATABASE_MIGRATION_URL: state.migrationDatabase,
    PAYLOAD_MIGRATING: 'true',
    RELEASE_MIGRATION: 'true',
  }
  run('node', ['scripts/database/migrate.mjs'], { env: ownerEnv })
  run('pnpm', ['payload:migrate'], { env: ownerEnv })
  stage = 'restricted runtime access'
  const { Client } = createRequire(join(root, 'apps/site/package.json'))('pg')
  const client = new Client({ connectionString: state.migrationDatabase })
  try {
    await client.connect()
    const exists = await client.query(
      "select 1 from pg_roles where rolname='starter_runtime'",
    )
    if (!exists.rowCount)
      await client.query(
        `create role starter_runtime login password '${state.runtimePassword}' nosuperuser nocreatedb nocreaterole noreplication nobypassrls`,
      )
    const role = await client.query(
      "select rolsuper,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles where rolname='starter_runtime'",
    )
    if (role.rows.length !== 1 || Object.values(role.rows[0]).some(Boolean))
      throw Error('Runtime database role must be restricted')
    await client.query(
      'grant starter_payload, starter_product_runtime, identity_runtime to starter_runtime; grant select,insert,update,delete on all tables in schema public to starter_payload; grant usage,select,update on all sequences in schema public to starter_payload',
    )
  } finally {
    await client.end()
  }
  stage = 'storage verification'
  console.log('Verifying private storage…')
  if (state.mode === 'local')
    run('node', ['scripts/database/init-storage.mjs'], { env: runtime })
  run('node', ['scripts/database/verify-storage.mjs'], { env: runtime })
  stage = 'administrator bootstrap'
  console.log('Preparing your CMS administrator…')
  run(
    'pnpm',
    [
      '--filter',
      '@starter/site',
      'exec',
      'tsx',
      'src/scripts/setup-administrator.ts',
    ],
    {
      env: {
        ...runtime,
        STARTER_SETUP_EMAIL: state.email,
        STARTER_SETUP_PASSWORD: state.adminPassword,
        STARTER_SETUP_CUSTOMER_PASSWORD: state.customerPassword,
      },
    },
  )
  if (state.mode === 'hosted') {
    stage = 'hosted runtime configuration'
    const project = state.vercelProject
    for (const [key, value] of Object.entries(runtime))
      vercel(
        `/v10/projects/${project.id}/env?teamId=${project.accountId}&upsert=true`,
        'POST',
        {
          key,
          value,
          type: [
            'DATABASE_URL',
            'PAYLOAD_SECRET',
            'AUTH_SECRET',
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
          ].includes(key)
            ? 'sensitive'
            : 'plain',
          target: ['production'],
        },
      )
    stage = 'deployment'
    console.log('Building and deploying your starter…')
    state.deployment = run('vercel', ['deploy', '--prod', '--yes'])
    save()
    console.log(
      `Website and CMS: ${state.siteURL}\nExpo backend configured. Native publishing and hosted Expo web deployment are separate; local Expo web uses local setup.`,
    )
  } else
    console.log(
      `Ready. Run pnpm dev to start website, CMS and Expo web. Website: ${state.siteURL}`,
    )
  state.completed = true
  save()
  console.log(
    'Administrator login is in .starter/administrator.json (private). Secrets were generated; none were printed. Optional email/social/newsletter integrations are not required for CMS login.',
  )
}
main().catch((error) => {
  console.error(
    `Setup stopped at ${stage}: ${error instanceof SyntaxError || error.code ? 'Operation failed; credential-bearing output withheld. Resolve the reported stage and retry.' : error.message}`,
  )
  process.exitCode = 1
})
