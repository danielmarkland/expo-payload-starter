#!/usr/bin/env node

import { spawn } from 'node:child_process'
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'

import {
  appVariables,
  canonicalURL,
  databaseURL,
  generatedSecret,
  getEnvironmentNames,
  getPublishableKey,
  productionConfig,
  redactedVariableSummary,
  sensitiveVariableNames,
  siteVariables,
} from './setup-production-lib.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')
let muteReadlineOutput = false
const readlineOutput = new Writable({
  write(chunk, _encoding, callback) {
    if (!muteReadlineOutput) process.stdout.write(chunk)
    callback()
  },
})
const rl = createInterface({
  input: process.stdin,
  output: readlineOutput,
  terminal: process.stdin.isTTY,
})

function heading(message) {
  process.stdout.write(`\n${message}\n${'-'.repeat(message.length)}\n`)
}

async function prompt(message, fallback = '') {
  const suffix = fallback ? ` (${fallback})` : ''
  const answer = (await rl.question(`${message}${suffix}: `)).trim()
  return answer || fallback
}

async function hiddenPrompt(message) {
  if (!process.stdin.isTTY)
    throw new Error(`${message} requires an interactive terminal.`)
  process.stdout.write(`${message}: `)
  muteReadlineOutput = true
  try {
    return (await rl.question('')).trim()
  } finally {
    muteReadlineOutput = false
    process.stdout.write('\n')
  }
}

async function confirm(message, defaultValue = false) {
  const marker = defaultValue ? 'Y/n' : 'y/N'
  const answer = (await rl.question(`${message} [${marker}] `))
    .trim()
    .toLowerCase()
  if (!answer) return defaultValue
  return answer === 'y' || answer === 'yes'
}

async function choose(message, choices, { allowCreate = false } = {}) {
  process.stdout.write(`\n${message}\n`)
  choices.forEach((choice, index) =>
    process.stdout.write(`  ${index + 1}. ${choice.label}\n`),
  )
  if (allowCreate)
    process.stdout.write(`  ${choices.length + 1}. Create a new project\n`)
  const maximum = choices.length + (allowCreate ? 1 : 0)
  while (true) {
    const value = Number.parseInt(await prompt('Choose a number'), 10)
    if (value >= 1 && value <= maximum) {
      return value > choices.length ? null : choices[value - 1].value
    }
    process.stdout.write(`Enter a number from 1 to ${maximum}.\n`)
  }
}

async function run(command, args, options = {}) {
  const {
    allowFailure = false,
    cwd = repositoryRoot,
    env = {},
    input,
    quiet = false,
  } = options
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (!quiet) {
        if (stdout) process.stdout.write(stdout)
        if (stderr) process.stderr.write(stderr)
      }
      const result = { code, stderr, stdout }
      if (code === 0 || allowFailure) resolvePromise(result)
      else
        reject(
          new Error(
            `${command} ${args[0] || ''} failed with exit code ${code}.`,
          ),
        )
    })
    if (input !== undefined) child.stdin.end(input)
    else child.stdin.end()
  })
}

function parseJSON(result, label) {
  try {
    return JSON.parse(result.stdout)
  } catch {
    throw new Error(`${label} did not return valid JSON.`)
  }
}

async function requireCLI(command, versionArgs, loginHint) {
  const version = await run(command, versionArgs, {
    allowFailure: true,
    quiet: true,
  })
  if (version.code !== 0)
    throw new Error(`${command} is not installed. ${loginHint}`)
  process.stdout.write(
    `${command}: ${version.stdout.trim() || version.stderr.trim()}\n`,
  )
}

async function supabaseProject() {
  const orgResult = await run(
    'supabase',
    ['orgs', 'list', '--output', 'json'],
    {
      allowFailure: true,
      quiet: true,
    },
  )
  if (orgResult.code !== 0)
    throw new Error('Supabase is not authenticated. Run `supabase login`.')
  const organizations = parseJSON(orgResult, 'Supabase organizations')
  const projectResult = await run(
    'supabase',
    ['projects', 'list', '--output', 'json'],
    {
      quiet: true,
    },
  )
  const projects = parseJSON(projectResult, 'Supabase projects')
  const selected = await choose(
    'Select the production Supabase project',
    projects.map((project) => ({
      label: `${project.name} (${project.ref}, ${project.region})${project.linked ? ' — currently linked' : ''}`,
      value: project,
    })),
    { allowCreate: true },
  )
  if (selected) return selected

  const organizationID = await choose(
    'Select the Supabase organization',
    organizations.map((organization) => ({
      label: `${organization.name} (${organization.id})`,
      value: organization.id,
    })),
  )
  const name = await prompt('New Supabase project name', 'expo-payload-starter')
  const region = await prompt('Supabase region', 'us-west-2')
  const size = await prompt('Compute size', 'nano')
  if (dryRun) {
    return {
      dryRunNew: true,
      id: 'new-project-ref',
      name,
      organization_id: organizationID,
      ref: 'new-project-ref',
      region,
      size,
    }
  }
  const password = await hiddenPrompt('New database password')
  if (!password) throw new Error('A database password is required.')
  if (
    !(await confirm(
      `Create ${name} in ${region} with ${size} compute? This may affect billing.`,
    ))
  ) {
    throw new Error('Supabase project creation cancelled.')
  }
  const created = await run(
    'supabase',
    [
      'projects',
      'create',
      name,
      '--org-id',
      organizationID,
      '--region',
      region,
      '--size',
      size,
      '--db-password',
      password,
      '--output',
      'json',
      '--yes',
    ],
    { quiet: true },
  )
  return {
    ...parseJSON(created, 'Created Supabase project'),
    databasePassword: password,
  }
}

async function vercelProjects() {
  const account = await run('vercel', ['whoami'], {
    allowFailure: true,
    quiet: true,
  })
  if (account.code !== 0)
    throw new Error('Vercel is not authenticated. Run `vercel login`.')
  const result = await run('vercel', ['project', 'ls', '--json'], {
    quiet: true,
  })
  const response = parseJSON(result, 'Vercel projects')
  return {
    projects: response.projects || [],
    scope: response.contextName || account.stdout.trim(),
  }
}

async function selectVercelProject(
  label,
  projects,
  scope,
  defaultName,
  appDirectory,
) {
  const selected = await choose(
    `Select the Vercel project for ${label}`,
    projects.map((project) => ({
      label: `${project.name}${project.latestProductionUrl ? ` — ${project.latestProductionUrl}` : ''}`,
      value: { ...project, created: false },
    })),
    { allowCreate: true },
  )
  if (selected) return selected

  const name = await prompt(`New Vercel project name for ${label}`, defaultName)
  if (dryRun) {
    return {
      created: true,
      dryRunNew: true,
      id: `new-${name}`,
      latestProductionUrl: `https://${name}.vercel.app`,
      name,
    }
  }
  if (!(await confirm(`Create Vercel project ${name} in ${scope}?`))) {
    throw new Error('Vercel project creation cancelled.')
  }
  await run('vercel', ['project', 'add', name, '--scope', scope])
  await run('vercel', [
    'link',
    '--yes',
    '--project',
    name,
    '--team',
    scope,
    '--cwd',
    join(repositoryRoot, appDirectory),
  ])
  const inspected = parseJSON(
    await run(
      'vercel',
      ['project', 'inspect', name, '--format', 'json', '--scope', scope],
      {
        quiet: true,
      },
    ),
    'Created Vercel project',
  )
  return {
    ...inspected,
    created: true,
    latestProductionUrl: `https://${name}.vercel.app`,
  }
}

async function linkAndConfigureVercel(project, scope, appDirectory, settings) {
  if (dryRun) {
    process.stdout.write(`[dry-run] Link ${appDirectory} to ${project.name}.\n`)
    return
  }
  await run('vercel', [
    'link',
    '--yes',
    '--project',
    project.id || project.name,
    '--team',
    scope,
    '--cwd',
    join(repositoryRoot, appDirectory),
  ])

  const body = join(
    tmpdir(),
    `vercel-project-${process.pid}-${project.name}.json`,
  )
  await writeFile(body, `${JSON.stringify(settings)}\n`, { mode: 0o600 })
  try {
    await run('vercel', [
      'api',
      `/v9/projects/${project.id || project.name}`,
      '--method',
      'PATCH',
      '--input',
      body,
      '--scope',
      scope,
      '--silent',
    ])
  } finally {
    await rm(body, { force: true })
  }

  if (project.created) {
    const remote = (
      await run('git', ['remote', 'get-url', 'origin'], { quiet: true })
    ).stdout.trim()
    await run('vercel', [
      'git',
      'connect',
      remote,
      '--cwd',
      join(repositoryRoot, appDirectory),
      '--scope',
      scope,
    ])
  }
}

async function vercelEnvironmentNames(project, scope) {
  const result = await run(
    'vercel',
    [
      'env',
      'ls',
      'production',
      '--project',
      project.id || project.name,
      '--scope',
      scope,
      '--format',
      'json',
    ],
    { allowFailure: true, quiet: true },
  )
  return result.code === 0
    ? getEnvironmentNames(parseJSON(result, 'Vercel environment'))
    : new Set()
}

async function applyVercelVariables(
  project,
  scope,
  variables,
  replaceExistingSecrets,
) {
  const existing = await vercelEnvironmentNames(project, scope)
  for (const [name, value] of Object.entries(variables)) {
    const sensitive = sensitiveVariableNames.has(name)
    if (sensitive && existing.has(name) && !replaceExistingSecrets) {
      process.stdout.write(`Preserving existing sensitive variable ${name}.\n`)
      continue
    }
    if (dryRun) {
      process.stdout.write(
        `[dry-run] ${existing.has(name) ? 'Update' : 'Add'} ${name}.\n`,
      )
      continue
    }
    await run(
      'vercel',
      [
        'env',
        'add',
        name,
        'production',
        '--project',
        project.id || project.name,
        '--scope',
        scope,
        sensitive ? '--sensitive' : '--no-sensitive',
        '--force',
        '--yes',
      ],
      { input: `${value}\n`, quiet: true },
    )
    process.stdout.write(
      `${existing.has(name) ? 'Updated' : 'Added'} ${name}.\n`,
    )
  }
}

async function pushProductionConfig(values) {
  const localConfig = await readFile(
    join(repositoryRoot, 'supabase/config.toml'),
    'utf8',
  )
  const directory = await mkdtemp(join(tmpdir(), 'starter-supabase-config-'))
  const configDirectory = join(directory, 'supabase')
  await mkdir(configDirectory, { recursive: true })
  const configPath = join(configDirectory, 'config.toml')
  await writeFile(configPath, productionConfig(localConfig, values), {
    mode: 0o600,
  })
  await chmod(configPath, 0o600)
  try {
    await run(
      'supabase',
      [
        'config',
        'push',
        '--project-ref',
        values.projectRef,
        '--workdir',
        directory,
      ],
      { quiet: true },
    )
    process.stdout.write('Updated Supabase API and Auth configuration.\n')
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
}

async function optionalConfiguration(projectRef) {
  const site = {}
  let google = null
  let functionSecrets = null
  let deployFunctions = false

  if (await confirm('Configure Google OAuth now?')) {
    process.stdout.write(
      `Register this callback in Google Cloud: https://${projectRef}.supabase.co/auth/v1/callback\n`,
    )
    if (!(await confirm('Continue after registering the callback?', true))) {
      throw new Error('Google OAuth configuration cancelled.')
    }
    google = {
      clientID: await prompt('Google OAuth client ID'),
      secret: dryRun
        ? '[dry-run]'
        : await hiddenPrompt('Google OAuth client secret'),
    }
  }
  if (await confirm('Configure Resend email now?')) {
    const resendAPIKey = dryRun
      ? '[dry-run]'
      : await hiddenPrompt('Resend API key')
    site.RESEND_API_KEY = resendAPIKey
    site.EMAIL_FROM_ADDRESS = await prompt(
      'Payload sender address',
      'hello@example.com',
    )
    site.EMAIL_FROM_NAME = await prompt(
      'Payload sender name',
      'Expo Payload Starter',
    )
    site.CONTACT_TO_ADDRESS = dryRun
      ? '[dry-run]'
      : await hiddenPrompt('Contact-form recipient address')
    if (
      await confirm(
        'Configure and deploy the example Supabase email functions?',
      )
    ) {
      functionSecrets = {
        RESEND_API_KEY: resendAPIKey,
        RESEND_FROM: await prompt(
          'Function sender value',
          `Expo Payload Starter <${site.EMAIL_FROM_ADDRESS}>`,
        ),
        RESEND_WEBHOOK_SECRET: dryRun
          ? '[dry-run]'
          : await hiddenPrompt('Resend webhook secret'),
      }
      deployFunctions = true
    }
  }
  if (await confirm('Configure Cloudflare Turnstile now?')) {
    site.NEXT_PUBLIC_TURNSTILE_SITE_KEY = await prompt('Turnstile site key')
    site.TURNSTILE_SECRET_KEY = dryRun
      ? '[dry-run]'
      : await hiddenPrompt('Turnstile secret key')
  }
  if (await confirm('Configure Google Tag Manager now?')) {
    site.NEXT_PUBLIC_GTM_CONTAINER_ID = await prompt('Website GTM container ID')
    site.EXPO_PUBLIC_GTM_CONTAINER_ID = await prompt(
      'Expo web GTM container ID',
    )
  }
  return { deployFunctions, functionSecrets, google, site }
}

async function setFunctionSecrets(projectRef, secrets) {
  if (!secrets) return
  const directory = await mkdtemp(join(tmpdir(), 'starter-function-secrets-'))
  const path = join(directory, '.env')
  const contents = Object.entries(secrets)
    .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
    .join('\n')
  await writeFile(path, `${contents}\n`, { mode: 0o600 })
  try {
    await run(
      'supabase',
      ['secrets', 'set', '--env-file', path, '--project-ref', projectRef],
      {
        quiet: true,
      },
    )
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
}

async function main() {
  heading(`Production setup${dryRun ? ' (dry run)' : ''}`)
  await requireCLI(
    'supabase',
    ['--version'],
    'Install it from https://supabase.com/docs/guides/local-development/cli/getting-started',
  )
  await requireCLI(
    'vercel',
    ['--version'],
    'Install it with `pnpm add -g vercel`.',
  )

  heading('Supabase')
  const project = await supabaseProject()
  const projectRef = project.ref || project.id
  const databasePassword =
    project.databasePassword ||
    (dryRun ? '[dry-run]' : await hiddenPrompt('Database password'))
  if (!databasePassword) throw new Error('The database password is required.')
  if (!dryRun) {
    await run('supabase', [
      'link',
      '--project-ref',
      projectRef,
      '--password',
      databasePassword,
      '--yes',
    ])
  } else {
    process.stdout.write(`[dry-run] Link Supabase project ${projectRef}.\n`)
  }

  const publishableKey = project.dryRunNew
    ? 'sb_publishable_[dry-run]'
    : getPublishableKey(
        parseJSON(
          await run(
            'supabase',
            [
              'projects',
              'api-keys',
              '--project-ref',
              projectRef,
              '--output',
              'json',
            ],
            { quiet: true },
          ),
          'Supabase API keys',
        ),
      )
  const poolerURL = dryRun
    ? `postgresql://postgres.${projectRef}@pooler.example.invalid:5432/postgres`
    : (
        await readFile(
          join(repositoryRoot, 'supabase/.temp/pooler-url'),
          'utf8',
        )
      ).trim()
  const database = databaseURL(poolerURL, databasePassword)
  const supabaseURL = `https://${projectRef}.supabase.co`
  const region = project.region || (await prompt('Supabase region'))
  if (!dryRun) {
    process.stdout.write(
      `\nOpen Supabase project ${projectRef}, go to Storage → S3, enable the S3 protocol, and generate an access-key pair. The secret is shown only once.\n`,
    )
  }
  const s3 = {
    accessKeyID: dryRun
      ? '[dry-run]'
      : await hiddenPrompt('Supabase S3 access key ID'),
    bucket: await prompt('Supabase S3 bucket', 'cms-media'),
    endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
    region,
    secretAccessKey: dryRun
      ? '[dry-run]'
      : await hiddenPrompt('Supabase S3 secret access key'),
  }
  if (!dryRun && (!s3.accessKeyID || !s3.secretAccessKey)) {
    throw new Error(
      'Both Supabase S3 credentials are required for Payload media uploads.',
    )
  }

  heading('Vercel')
  const vercel = await vercelProjects()
  const websiteProject = await selectVercelProject(
    'Website + CMS',
    vercel.projects,
    vercel.scope,
    'expo-payload-site',
    'apps/site',
  )
  const appProject = await selectVercelProject(
    'Expo web app',
    vercel.projects.filter((candidate) => candidate.id !== websiteProject.id),
    vercel.scope,
    'expo-payload-app',
    'apps/app',
  )
  await linkAndConfigureVercel(websiteProject, vercel.scope, 'apps/site', {
    framework: 'nextjs',
    rootDirectory: 'apps/site',
  })
  await linkAndConfigureVercel(appProject, vercel.scope, 'apps/app', {
    buildCommand: 'pnpm build',
    framework: null,
    outputDirectory: 'dist',
    rootDirectory: 'apps/app',
  })

  const siteURL = canonicalURL(
    await prompt(
      'Canonical website URL',
      websiteProject.latestProductionUrl ||
        `https://${websiteProject.name}.vercel.app`,
    ),
  )
  const appURL = canonicalURL(
    await prompt(
      'Canonical Expo web URL',
      appProject.latestProductionUrl || `https://${appProject.name}.vercel.app`,
    ),
  )
  const optional = await optionalConfiguration(projectRef)
  const nativeScheme =
    (await import('../../../apps/app/app.config.js')).default?.scheme ||
    'expopayloadstarter'
  const websiteVariables = siteVariables({
    appURL,
    database,
    optional: optional.site,
    payloadSecret: generatedSecret(),
    previewSecret: generatedSecret(),
    s3,
    siteURL,
  })
  const expoVariables = appVariables({
    gtmContainerID: optional.site.EXPO_PUBLIC_GTM_CONTAINER_ID,
    publishableKey,
    siteURL,
    supabaseURL,
  })
  delete websiteVariables.EXPO_PUBLIC_GTM_CONTAINER_ID

  heading('Planned production configuration')
  process.stdout.write(
    `${JSON.stringify(
      {
        app: redactedVariableSummary(expoVariables),
        site: redactedVariableSummary(websiteVariables),
        supabase: { projectRef, region },
        vercel: {
          app: appProject.name,
          scope: vercel.scope,
          website: websiteProject.name,
        },
      },
      null,
      2,
    )}\n`,
  )

  const replaceExistingSecrets = dryRun
    ? false
    : await confirm(
        'Replace existing sensitive Vercel variables with values from this run?',
      )
  if (
    !dryRun &&
    !(await confirm('Apply the Vercel production variables shown above?'))
  ) {
    throw new Error('Vercel environment configuration cancelled.')
  }
  await applyVercelVariables(
    websiteProject,
    vercel.scope,
    websiteVariables,
    replaceExistingSecrets,
  )
  await applyVercelVariables(
    appProject,
    vercel.scope,
    expoVariables,
    replaceExistingSecrets,
  )

  heading('Migrations and hosted configuration')
  if (dryRun) {
    process.stdout.write('[dry-run] Inspect and apply Supabase migrations.\n')
    process.stdout.write(
      '[dry-run] Push production Supabase API/Auth configuration.\n',
    )
    process.stdout.write(
      '[dry-run] Apply Payload migrations to the same database.\n',
    )
  } else {
    await run('supabase', ['db', 'push', '--dry-run', '--linked'])
    if (!(await confirm('Apply the pending Supabase migrations?')))
      throw new Error('Supabase migration cancelled.')
    await run('supabase', ['db', 'push', '--linked'])
    if (
      !(await confirm('Push production Supabase API and Auth configuration?'))
    ) {
      throw new Error('Supabase configuration cancelled.')
    }
    await pushProductionConfig({
      appURL,
      google: optional.google,
      nativeScheme,
      projectRef,
    })
    if (
      !(await confirm('Apply Payload CMS migrations to the same database?'))
    ) {
      throw new Error('Payload migration cancelled.')
    }
    await run('pnpm', ['payload:migrate'], { env: { DATABASE_URL: database } })
    if (optional.functionSecrets)
      await setFunctionSecrets(projectRef, optional.functionSecrets)
    if (optional.deployFunctions) {
      await run('supabase', [
        'functions',
        'deploy',
        'send-welcome-email',
        'resend-webhook',
        '--project-ref',
        projectRef,
      ])
    }
  }

  heading('Deployment')
  if (dryRun) {
    process.stdout.write(
      '[dry-run] Ask before deploying Website + CMS and Expo web to production.\n',
    )
  } else if (await confirm('Deploy both Vercel projects to production now?')) {
    await run('vercel', [
      'deploy',
      '--prod',
      '--yes',
      '--project',
      websiteProject.id,
      '--scope',
      vercel.scope,
    ])
    await run('vercel', [
      'deploy',
      '--prod',
      '--yes',
      '--project',
      appProject.id,
      '--scope',
      vercel.scope,
    ])
  } else {
    process.stdout.write(
      'Configuration is complete. Deploy later from Vercel or rerun this command.\n',
    )
  }

  process.stdout.write(
    `\nSetup complete. Verify ${siteURL}/api/site-config, ${siteURL}/admin, and ${appURL}.\n`,
  )
}

try {
  await main()
} catch (error) {
  process.stderr.write(
    `\nSetup stopped: ${error instanceof Error ? error.message : String(error)}\n`,
  )
  process.exitCode = 1
} finally {
  rl.close()
}
