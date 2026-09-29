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
  branchCredentials,
  canonicalURL,
  databaseURL,
  generatedSecret,
  getEnvironmentNames,
  getPublishableKey,
  getSetupProfile,
  hostedConfig,
  redactedVariableSummary,
  sensitiveVariableNames,
  siteVariables,
  setupProfiles,
  validateGitBranch,
} from './setup-production-lib.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')

function argumentValue(name) {
  const inline = process.argv.find((argument) =>
    argument.startsWith(`${name}=`),
  )
  if (inline) return inline.slice(name.length + 1)
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const requestedProfile = argumentValue('--profile')
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

async function setupProfile() {
  if (requestedProfile) return getSetupProfile(requestedProfile)
  const id = await choose(
    'Choose a deployment profile',
    Object.entries(setupProfiles).map(([value, profile]) => ({
      label: profile.label,
      value,
    })),
  )
  return getSetupProfile(id)
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

function branchList(value) {
  if (Array.isArray(value)) return value
  return value.branches || value.data || []
}

async function developmentBranch(projectRef, gitBranch, region) {
  if (dryRun) {
    return {
      API_URL: 'https://development-branch.supabase.co',
      POSTGRES_URL:
        'postgresql://postgres.development@pooler.example.invalid:5432/postgres',
      PUBLISHABLE_KEY: 'sb_publishable_[dry-run-development]',
      git_branch: gitBranch,
      name: gitBranch,
      project_ref: 'development-branch-ref',
    }
  }

  const listed = await run(
    'supabase',
    [
      '--experimental',
      'branches',
      'list',
      '--project-ref',
      projectRef,
      '--output',
      'json',
    ],
    { allowFailure: true, quiet: true },
  )
  if (listed.code !== 0) {
    throw new Error(
      'Supabase Branching is unavailable. The staged profile requires a Pro-plan project with Branching enabled.',
    )
  }
  const branches = branchList(parseJSON(listed, 'Supabase branches'))
  let branch = branches.find(
    (candidate) =>
      candidate.git_branch === gitBranch || candidate.name === gitBranch,
  )
  if (!branch) {
    if (
      !(await confirm(
        `Create persistent Supabase branch ${gitBranch} without production data? This may affect billing.`,
      ))
    ) {
      throw new Error('Supabase development branch creation cancelled.')
    }
    const created = await run(
      'supabase',
      [
        '--experimental',
        'branches',
        'create',
        gitBranch,
        '--project-ref',
        projectRef,
        '--git-branch',
        gitBranch,
        '--persistent',
        '--region',
        region,
        '--output',
        'json',
        '--yes',
      ],
      { quiet: true },
    )
    branch = parseJSON(created, 'Created Supabase branch')
  }
  const identifier =
    branch.id || branch.ref || branch.project_ref || branch.name
  const details = await run(
    'supabase',
    [
      '--experimental',
      'branches',
      'get',
      identifier,
      '--project-ref',
      projectRef,
      '--output',
      'json',
    ],
    { quiet: true },
  )
  return parseJSON(details, 'Supabase development branch')
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

async function vercelEnvironmentNames(project, scope, environment, gitBranch) {
  const environmentArgs = ['env', 'ls', environment]
  if (gitBranch) environmentArgs.push(gitBranch)
  const result = await run(
    'vercel',
    [
      ...environmentArgs,
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
  { environment = 'production', gitBranch } = {},
) {
  const existing = await vercelEnvironmentNames(
    project,
    scope,
    environment,
    gitBranch,
  )
  for (const [name, value] of Object.entries(variables)) {
    const sensitive = sensitiveVariableNames.has(name)
    if (sensitive && existing.has(name) && !replaceExistingSecrets) {
      process.stdout.write(`Preserving existing sensitive variable ${name}.\n`)
      continue
    }
    if (dryRun) {
      process.stdout.write(
        `[dry-run] ${existing.has(name) ? 'Update' : 'Add'} ${name} in Vercel ${environment}${gitBranch ? ` for ${gitBranch}` : ''}.\n`,
      )
      continue
    }
    await run(
      'vercel',
      [
        'env',
        'add',
        name,
        environment,
        '--project',
        project.id || project.name,
        '--scope',
        scope,
        sensitive ? '--sensitive' : '--no-sensitive',
        '--force',
        '--yes',
        ...(gitBranch ? ['--git-branch', gitBranch] : []),
      ],
      { input: `${value}\n`, quiet: true },
    )
    process.stdout.write(
      `${existing.has(name) ? 'Updated' : 'Added'} ${name}.\n`,
    )
  }
}

async function pushHostedConfig(values) {
  const localConfig = await readFile(
    join(repositoryRoot, 'supabase/config.toml'),
    'utf8',
  )
  const directory = await mkdtemp(join(tmpdir(), 'starter-supabase-config-'))
  const configDirectory = join(directory, 'supabase')
  await mkdir(configDirectory, { recursive: true })
  const configPath = join(configDirectory, 'config.toml')
  await writeFile(configPath, hostedConfig(localConfig, values), {
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

async function optionalConfiguration(projectRef, { includeApp }) {
  const site = {}
  const siteSettings = { integrations: {}, links: {} }
  const footerNavigation = { newsletter: {} }
  let google = null

  if (includeApp && (await confirm('Configure Google OAuth now?'))) {
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
    const contactAddress = await prompt(
      'Contact-form recipient address',
      site.EMAIL_FROM_ADDRESS,
    )
    if (contactAddress !== site.EMAIL_FROM_ADDRESS) {
      site.CONTACT_TO_ADDRESS = contactAddress
    }
  }
  if (await confirm('Configure Cloudflare Turnstile now?')) {
    siteSettings.integrations.turnstileSiteKey =
      await prompt('Turnstile site key')
    site.TURNSTILE_SECRET_KEY = dryRun
      ? '[dry-run]'
      : await hiddenPrompt('Turnstile secret key')
  }
  if (await confirm('Configure MailerLite newsletter signup now?')) {
    site.MAILERLITE_API_KEY = dryRun
      ? '[dry-run]'
      : await hiddenPrompt('MailerLite API key')
    footerNavigation.newsletter.groupId = await prompt('MailerLite group ID')
  }
  if (await confirm('Configure Google Tag Manager now?')) {
    siteSettings.integrations.googleTagManagerId = await prompt(
      'Shared website and Expo web GTM container ID',
    )
  }
  return { footerNavigation, google, site, siteSettings }
}

async function collectS3(environment, projectRef, region) {
  if (!dryRun) {
    process.stdout.write(
      `\nOpen Supabase ${environment} ${projectRef}, go to Storage → S3, enable the S3 protocol, and generate an access-key pair. The secret is shown only once.\n`,
    )
  }
  const s3 = {
    accessKeyID: dryRun
      ? '[dry-run]'
      : await hiddenPrompt(`${environment} Supabase S3 access key ID`),
    endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
    region,
    secretAccessKey: dryRun
      ? '[dry-run]'
      : await hiddenPrompt(`${environment} Supabase S3 secret access key`),
  }
  if (!dryRun && (!s3.accessKeyID || !s3.secretAccessKey)) {
    throw new Error(
      `Both ${environment} Supabase S3 credentials are required for Payload media uploads.`,
    )
  }
  return s3
}

async function productionEnvironment(project) {
  const projectRef = project.ref || project.id
  const databasePassword =
    project.databasePassword ||
    (dryRun ? '[dry-run]' : await hiddenPrompt('Production database password'))
  if (!databasePassword)
    throw new Error('The production database password is required.')
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
    process.stdout.write(
      `[dry-run] Link production Supabase project ${projectRef}.\n`,
    )
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
  const region = project.region || (await prompt('Supabase region'))
  return {
    database: databaseURL(poolerURL, databasePassword),
    label: 'production',
    projectRef,
    publishableKey,
    region,
    supabaseURL: `https://${projectRef}.supabase.co`,
    target: { environment: 'production' },
  }
}

function previewURL(project, branch, scope) {
  const segment = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '')
  return `https://${segment(project.name)}-git-${segment(branch)}-${segment(scope)}.vercel.app`
}

async function applyEnvironment({
  appProject,
  appURL,
  environment,
  includeApp,
  nativeScheme,
  optional,
  replaceExistingSecrets,
  siteURL,
  vercelScope,
  websiteProject,
}) {
  const websiteVariables = siteVariables({
    database: environment.database,
    optional: optional.site,
    payloadSecret: generatedSecret(),
    s3: environment.s3,
    siteURL: environment.target.environment === 'production' ? null : siteURL,
  })
  const appEnvironmentVariables = includeApp
    ? appVariables({
        publishableKey: environment.publishableKey,
        siteURL,
        supabaseURL: environment.supabaseURL,
      })
    : null
  process.stdout.write(
    `${JSON.stringify(
      {
        app: appEnvironmentVariables
          ? redactedVariableSummary(appEnvironmentVariables)
          : 'not deployed',
        environment: environment.label,
        footerNavigation: optional.footerNavigation,
        site: redactedVariableSummary(websiteVariables),
        siteSettings: optional.siteSettings,
        supabase: {
          projectRef: environment.projectRef,
          region: environment.region,
        },
        vercelTarget: environment.target,
      },
      null,
      2,
    )}\n`,
  )

  await applyVercelVariables(
    websiteProject,
    vercelScope,
    websiteVariables,
    replaceExistingSecrets,
    environment.target,
  )
  if (appEnvironmentVariables) {
    await applyVercelVariables(
      appProject,
      vercelScope,
      appEnvironmentVariables,
      replaceExistingSecrets,
      environment.target,
    )
  }

  if (dryRun) {
    process.stdout.write(
      `[dry-run] Inspect and apply ${environment.label} Supabase migrations.\n`,
    )
    process.stdout.write(
      `[dry-run] Push ${environment.label} Supabase API/Auth configuration.\n`,
    )
    process.stdout.write(
      `[dry-run] Apply ${environment.label} Payload migrations.\n`,
    )
    process.stdout.write(
      `[dry-run] Store ${environment.label} public integrations in Payload Site settings.\n`,
    )
    return
  }

  const databaseArgs = environment.target.gitBranch
    ? ['--db-url', environment.database]
    : ['--linked']
  await run('supabase', ['db', 'push', '--dry-run', ...databaseArgs])
  if (
    !(await confirm(`Apply pending ${environment.label} Supabase migrations?`))
  ) {
    throw new Error(`${environment.label} Supabase migration cancelled.`)
  }
  await run('supabase', ['db', 'push', ...databaseArgs])
  if (
    !(await confirm(
      `Push ${environment.label} Supabase API and Auth configuration?`,
    ))
  ) {
    throw new Error(`${environment.label} Supabase configuration cancelled.`)
  }
  await pushHostedConfig({
    appURL: appURL || siteURL,
    google: optional.google,
    nativeScheme: includeApp ? nativeScheme : null,
    projectRef: environment.projectRef,
  })
  if (!(await confirm(`Apply ${environment.label} Payload CMS migrations?`))) {
    throw new Error(`${environment.label} Payload migration cancelled.`)
  }
  await run('pnpm', ['payload:migrate'], {
    env: websiteVariables,
  })
  await run(
    'pnpm',
    [
      '--filter',
      '@starter/site',
      'exec',
      'tsx',
      'src/scripts/configure-site-settings.ts',
    ],
    {
      env: {
        ...websiteVariables,
        SETUP_APP_URL: appURL || '',
        SETUP_GTM_CONTAINER_ID:
          optional.siteSettings.integrations.googleTagManagerId || '',
        SETUP_MAILERLITE_GROUP_ID:
          optional.footerNavigation.newsletter.groupId || '',
        SETUP_TURNSTILE_SITE_KEY:
          optional.siteSettings.integrations.turnstileSiteKey || '',
      },
    },
  )
}

async function main() {
  const profile = await setupProfile()
  heading(`Hosted setup: ${profile.label}${dryRun ? ' (dry run)' : ''}`)
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

  let productionBranch = 'main'
  let developmentGitBranch = null
  if (profile.development) {
    productionBranch = validateGitBranch(
      await prompt('Production Git branch', 'main'),
    )
    developmentGitBranch = validateGitBranch(
      await prompt('Development Git branch', 'develop'),
    )
    if (productionBranch === developmentGitBranch) {
      throw new Error('Production and development Git branches must differ.')
    }
  }

  heading('Supabase production')
  const project = await supabaseProject()
  const production = await productionEnvironment(project)
  production.s3 = await collectS3(
    'production',
    production.projectRef,
    production.region,
  )

  let development = null
  if (profile.development) {
    heading('Supabase development')
    const details = await developmentBranch(
      production.projectRef,
      developmentGitBranch,
      production.region,
    )
    const credentials = branchCredentials(details)
    development = {
      ...credentials,
      label: 'development',
      region: details.region || production.region,
      target: {
        environment: 'preview',
        gitBranch: developmentGitBranch,
      },
    }
    development.s3 = await collectS3(
      'development',
      development.projectRef,
      development.region,
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
  const includeAnyApp = profile.productionApp || profile.developmentApp
  const appProject = includeAnyApp
    ? await selectVercelProject(
        'Expo web app',
        vercel.projects.filter(
          (candidate) => candidate.id !== websiteProject.id,
        ),
        vercel.scope,
        'expo-payload-app',
        'apps/app',
      )
    : null
  await linkAndConfigureVercel(websiteProject, vercel.scope, 'apps/site', {
    framework: 'nextjs',
    ...(profile.development ? { productionBranch } : {}),
    rootDirectory: 'apps/site',
  })
  if (appProject) {
    await linkAndConfigureVercel(appProject, vercel.scope, 'apps/app', {
      buildCommand: 'pnpm build',
      framework: null,
      outputDirectory: 'dist',
      ...(profile.development ? { productionBranch } : {}),
      rootDirectory: 'apps/app',
    })
  }

  const siteURL = canonicalURL(
    await prompt(
      'Canonical website URL',
      websiteProject.latestProductionUrl ||
        `https://${websiteProject.name}.vercel.app`,
    ),
  )
  const productionAppURL = profile.productionApp
    ? canonicalURL(
        await prompt(
          'Canonical production Expo web URL',
          appProject.latestProductionUrl ||
            `https://${appProject.name}.vercel.app`,
        ),
      )
    : null
  let developmentSiteURL = null
  let developmentAppURL = null
  if (development) {
    developmentSiteURL = canonicalURL(
      await prompt(
        'Canonical development website URL',
        previewURL(websiteProject, developmentGitBranch, vercel.scope),
      ),
    )
    developmentAppURL = canonicalURL(
      await prompt(
        'Canonical development Expo web URL',
        previewURL(appProject, developmentGitBranch, vercel.scope),
      ),
    )
  }
  const nativeScheme =
    (await import('../../../apps/app/app.config.js')).default?.scheme ||
    'expopayloadstarter'
  heading('Optional production services')
  const productionOptional = await optionalConfiguration(
    production.projectRef,
    { includeApp: profile.productionApp },
  )
  const developmentOptional = development
    ? (heading('Optional development services'),
      await optionalConfiguration(development.projectRef, {
        includeApp: profile.developmentApp,
      }))
    : null

  const replaceExistingSecrets = dryRun
    ? false
    : await confirm(
        'Replace existing sensitive Vercel variables with values from this run?',
      )
  if (
    !dryRun &&
    !(await confirm('Apply the Vercel environment variables shown above?'))
  ) {
    throw new Error('Vercel environment configuration cancelled.')
  }
  heading('Production configuration')
  await applyEnvironment({
    appProject,
    appURL: productionAppURL,
    environment: production,
    includeApp: profile.productionApp,
    nativeScheme,
    optional: productionOptional,
    replaceExistingSecrets,
    siteURL,
    vercelScope: vercel.scope,
    websiteProject,
  })
  if (development) {
    heading('Development configuration')
    await applyEnvironment({
      appProject,
      appURL: developmentAppURL,
      environment: development,
      includeApp: profile.developmentApp,
      nativeScheme,
      optional: developmentOptional,
      replaceExistingSecrets,
      siteURL: developmentSiteURL,
      vercelScope: vercel.scope,
      websiteProject,
    })
  }

  heading('Deployment')
  if (profile.development) {
    process.stdout.write(
      `Push ${developmentGitBranch} to create the branch-scoped Vercel Preview deployments. Production remains on ${productionBranch}.\n`,
    )
  } else if (dryRun) {
    process.stdout.write(
      `[dry-run] Ask before deploying ${profile.productionApp ? 'Website + CMS and Expo web' : 'Website + CMS'} to production.\n`,
    )
  } else if (
    await confirm(
      `Deploy ${profile.productionApp ? 'both Vercel projects' : 'the Website + CMS project'} to production now?`,
    )
  ) {
    await run('vercel', [
      'deploy',
      '--prod',
      '--yes',
      '--project',
      websiteProject.id,
      '--scope',
      vercel.scope,
    ])
    if (profile.productionApp) {
      await run('vercel', [
        'deploy',
        '--prod',
        '--yes',
        '--project',
        appProject.id,
        '--scope',
        vercel.scope,
      ])
    }
  } else {
    process.stdout.write(
      'Configuration is complete. Deploy later from Vercel or rerun this command.\n',
    )
  }

  const verificationURLs = [
    `${siteURL}/api/site-config`,
    `${siteURL}/admin`,
    productionAppURL,
    developmentSiteURL && `${developmentSiteURL}/admin`,
    developmentAppURL,
  ].filter(Boolean)
  process.stdout.write(
    `\nSetup complete. Verify ${verificationURLs.join(', ')}.\n`,
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
