import assert from 'node:assert/strict'
import test from 'node:test'

import {
  appVariables,
  branchCredentials,
  canonicalURL,
  databaseURL,
  getEnvironmentNames,
  getPublishableKey,
  getSetupProfile,
  productionConfig,
  redact,
  redactedVariableSummary,
  siteVariables,
  validateGitBranch,
} from './setup-production-lib.mjs'

test('normalizes public URLs', () => {
  assert.equal(
    canonicalURL('https://example.com/path/?ignored=yes#hash'),
    'https://example.com/path',
  )
})

test('adds a percent-encoded password to a pooler URL', () => {
  const result = databaseURL(
    'postgresql://postgres.ref@pooler.example.com:5432/postgres',
    'p@ss:/',
  )
  assert.equal(
    result,
    'postgresql://postgres.ref:p%40ss%3A%2F@pooler.example.com:5432/postgres',
  )
})

test('selects only the modern publishable key', () => {
  assert.equal(
    getPublishableKey([
      { api_key: 'legacy', type: 'legacy' },
      { api_key: 'sb_publishable_safe', type: 'publishable' },
      { api_key: 'sb_secret_unsafe', type: 'secret' },
    ]),
    'sb_publishable_safe',
  )
})

test('never falls back to a service-role or legacy key', () => {
  assert.throws(() =>
    getPublishableKey([{ api_key: 'secret', type: 'secret' }]),
  )
})

test('reads Vercel environment names from supported response shapes', () => {
  assert.deepEqual(
    [...getEnvironmentNames({ envs: [{ key: 'A' }, { key: 'B' }] })],
    ['A', 'B'],
  )
  assert.deepEqual([...getEnvironmentNames([{ name: 'C' }])], ['C'])
})

test('builds the site and app variable sets', () => {
  const site = siteVariables({
    appURL: 'https://app.example.com',
    database: 'postgresql://secret',
    payloadSecret: 'payload',
    previewSecret: 'preview',
    s3: {
      accessKeyID: 'access',
      bucket: 'cms-media',
      endpoint: 'https://ref.storage.supabase.co/storage/v1/s3',
      region: 'us-west-2',
      secretAccessKey: 'secret',
    },
    siteURL: 'https://www.example.com',
  })
  assert.equal(site.NEXT_PUBLIC_SITE_URL, 'https://www.example.com')
  assert.equal(site.SUPABASE_S3_BUCKET, 'cms-media')

  const landing = siteVariables({
    database: 'postgresql://secret',
    payloadSecret: 'payload',
    previewSecret: 'preview',
    s3: {
      accessKeyID: 'access',
      bucket: 'cms-media',
      endpoint: 'https://ref.storage.supabase.co/storage/v1/s3',
      region: 'us-west-2',
      secretAccessKey: 'secret',
    },
    siteURL: 'https://www.example.com',
  })
  assert.equal('NEXT_PUBLIC_APP_URL' in landing, false)

  const app = appVariables({
    publishableKey: 'publishable',
    siteURL: 'https://www.example.com',
    supabaseURL: 'https://ref.supabase.co',
  })
  assert.equal(app.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'publishable')
})

test('describes the three supported setup profiles', () => {
  assert.deepEqual(getSetupProfile('landing'), {
    id: 'landing',
    label: 'Landing site',
    productionApp: false,
    development: false,
    developmentApp: false,
  })
  assert.equal(getSetupProfile('single-app').productionApp, true)
  assert.equal(getSetupProfile('staged').development, true)
  assert.throws(() => getSetupProfile('unknown'), /Unknown setup profile/)
})

test('validates user-selected Git branches', () => {
  assert.equal(validateGitBranch('release/main'), 'release/main')
  assert.equal(validateGitBranch('develop'), 'develop')
  assert.throws(() => validateGitBranch('bad branch'), /Invalid Git branch/)
  assert.throws(() => validateGitBranch('../main'), /Invalid Git branch/)
})

test('reads isolated Supabase branch credentials without legacy keys', () => {
  assert.deepEqual(
    branchCredentials({
      API_URL: 'https://branch.supabase.co',
      POSTGRES_URL: 'postgresql://branch',
      PUBLISHABLE_KEY: 'sb_publishable_branch',
      project_ref: 'branch-ref',
    }),
    {
      database: 'postgresql://branch',
      projectRef: 'branch-ref',
      publishableKey: 'sb_publishable_branch',
      supabaseURL: 'https://branch.supabase.co',
    },
  )
  assert.throws(
    () =>
      branchCredentials({
        ANON_KEY: 'legacy',
        API_URL: 'https://branch.supabase.co',
        POSTGRES_URL: 'postgresql://branch',
        project_ref: 'branch-ref',
      }),
    /did not return/,
  )
})

test('creates production auth config without retaining localhost or duplicate Google config', () => {
  const local = `project_id = "local"\n[auth]\nsite_url = "http://localhost:8081"\nadditional_redirect_urls = [\n  "http://localhost:8081/auth/callback",\n  "old://auth/callback"\n]\n[auth.email]\nenable_signup = true\n[auth.external.google]\nenabled = false\nclient_id = "old"\nsecret = "old"\n`
  const result = productionConfig(local, {
    appURL: 'https://app.example.com',
    google: { clientID: 'client', secret: 'secret' },
    nativeScheme: 'starter',
    projectRef: 'project-ref',
  })
  assert.doesNotMatch(result, /localhost|client_id = "old"/)
  assert.match(result, /site_url = "https:\/\/app\.example\.com"/)
  assert.match(result, /"starter:\/\/auth\/callback"/)
  assert.equal(result.match(/\[auth\.external\.google\]/g)?.length, 1)
})

test('creates landing auth config without a native callback', () => {
  const local = `project_id = "local"\n[auth]\nsite_url = "http://localhost:8081"\nadditional_redirect_urls = [\n  "http://localhost:8081/auth/callback"\n]\n[auth.email]\nenable_signup = true\n`
  const result = productionConfig(local, {
    appURL: 'https://www.example.com',
    google: null,
    nativeScheme: null,
    projectRef: 'project-ref',
  })
  assert.match(result, /site_url = "https:\/\/www\.example\.com"/)
  assert.match(result, /"https:\/\/www\.example\.com\/auth\/callback"/)
  assert.doesNotMatch(result, /null:\/\/|starter:\/\//)
})

test('redacts connection strings, keys, and sensitive variable values', () => {
  assert.equal(
    redact('postgresql://postgres:password@db.example.com/postgres'),
    'postgresql://postgres:[REDACTED]@db.example.com/postgres',
  )
  assert.equal(redact('sb_secret_abc123'), 'sb_[REDACTED]')
  assert.deepEqual(
    redactedVariableSummary({
      DATABASE_URL: 'secret',
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
    }),
    {
      DATABASE_URL: '[sensitive]',
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
    },
  )
})
