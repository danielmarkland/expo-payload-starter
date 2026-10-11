#!/usr/bin/env node
// Configure one explicit environment; code/schema promotion remains MR -> develop -> main.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import {
  siteVariables,
  generatedSecret,
  redactedVariableSummary,
  getEnvironmentNames,
} from './setup-production-lib.mjs'
const args = process.argv.slice(2)
function required(name) {
  const index = args.indexOf(name)
  if (index < 0 || !args[index + 1]) throw Error(`${name} is required`)
  return args[index + 1]
}
const environment = required('--environment')
if (!['development', 'production'].includes(environment))
  throw Error('Environment must be development or production')
const project = required('--vercel-project-id'),
  org = required('--vercel-org-id')
const source = parseEnv(readFileSync(required('--env-file'), 'utf8'))
for (const key of [
  'DATABASE_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ENDPOINT_URL_S3',
  'AWS_REGION',
])
  if (!source[key] || source[key] === '[SENSITIVE]')
    throw Error(`Missing ${key}`)
const config = siteVariables({
  database: source.DATABASE_URL,
  payloadSecret: source.PAYLOAD_SECRET || generatedSecret(),
  authSecret: source.AUTH_SECRET || generatedSecret(),
  s3: {
    accessKeyID: source.AWS_ACCESS_KEY_ID,
    secretAccessKey: source.AWS_SECRET_ACCESS_KEY,
    endpoint: source.AWS_ENDPOINT_URL_S3,
    region: source.AWS_REGION,
  },
  siteURL: required('--site-url'),
  origins: required('--auth-trusted-origins'),
})
console.log(
  JSON.stringify(
    { environment, project, variables: redactedVariableSummary(config) },
    null,
    2,
  ),
)
if (!args.includes('--dry-run')) {
  const run = (argv, input) =>
    execFileSync('vercel', ['api', ...argv], { input, encoding: 'utf8' })
  const names = getEnvironmentNames(
    JSON.parse(run([`/v10/projects/${project}/env?teamId=${org}`])),
  )
  for (const [key, value] of Object.entries(config)) {
    if (names.has(key) && !args.includes('--replace-existing')) continue
    run(
      [
        `/v10/projects/${project}/env?teamId=${org}&upsert=true`,
        '--method',
        'POST',
        '--input',
        '-',
      ],
      JSON.stringify({
        key,
        value,
        type: [
          'PAYLOAD_SECRET',
          'AUTH_SECRET',
          'DATABASE_URL',
          'AWS_ACCESS_KEY_ID',
          'AWS_SECRET_ACCESS_KEY',
        ].includes(key)
          ? 'sensitive'
          : 'plain',
        target:
          environment === 'development'
            ? ['production', 'preview', 'development']
            : ['production'],
      }),
    )
  }
}
console.log(
  'Configure matching GitHub release environment, then promote MR -> develop -> main. Setup does not deploy or migrate.',
)
