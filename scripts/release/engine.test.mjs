import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  executeRelease,
  compatible,
  redact,
  releaseEnvironment,
} from './engine.mjs'
function fixture(
  fail,
  previous = { id: 'previous', migrationDigest: 'schema' },
) {
  const calls = []
  let report
  const driver = Object.fromEntries(
    [
      'preflight',
      'previous',
      'build',
      'migrate',
      'publish',
      'deploy',
      'activate',
      'smoke',
      'rollback',
      'report',
    ].map((stage) => [
      stage,
      async (_ctx, arg) => {
        calls.push(stage)
        if (stage === 'report') report = arg
        if (stage === fail) throw new Error(`${stage} failed`)
        if (stage === 'previous') return previous
        return stage === 'deploy' ? 'deployment' : 'passed'
      },
    ]),
  )
  return {
    calls,
    driver,
    get report() {
      return report
    },
  }
}
const context = {
  sha: 'a'.repeat(40),
  environment: 'production',
  migrationDigest: 'schema',
}
test('release orders validation/build/migration/publication/deployment/smoke', async () => {
  const f = fixture()
  await executeRelease(f.driver, context)
  assert.deepEqual(f.calls, [
    'preflight',
    'previous',
    'build',
    'migrate',
    'publish',
    'deploy',
    'activate',
    'smoke',
    'report',
  ])
  assert.equal(f.report.status, 'passed')
})
test('migration failure prevents publication and deployment; retries use same identity', async () => {
  const f = fixture('migrate')
  await assert.rejects(executeRelease(f.driver, context))
  assert.equal(f.calls.includes('deploy'), false)
  assert.equal(f.calls.includes('publish'), false)
  assert.equal(f.report.sha, context.sha)
})
test('smoke failure restores only a provably compatible deployment', async () => {
  const same = fixture('smoke')
  await assert.rejects(executeRelease(same.driver, context))
  assert.ok(same.calls.includes('rollback'))
  const changed = fixture('smoke', {
    id: 'previous',
    migrationDigest: 'different',
  })
  await assert.rejects(executeRelease(changed.driver, context))
  assert.equal(changed.calls.includes('rollback'), false)
  assert.equal(compatible({ id: 'previous' }, 'schema'), false)
})
test('credentials never enter release reports', () => {
  const value = 'postgres://user:password@db.test/db'
  assert.equal(
    redact(`failed ${value} token-secret-value`, {
      DATABASE_MIGRATION_URL: value,
      VERCEL_TOKEN: 'token-secret-value',
    }),
    'failed [REDACTED] [REDACTED]',
  )
})
test('only tracked branches have deployment environments', () => {
  assert.equal(releaseEnvironment('develop'), 'development')
  assert.equal(releaseEnvironment('main'), 'production')
  assert.throws(() => releaseEnvironment('codex/task'))
})

test('preflight failure is recorded and cannot build or mutate deployments', async () => {
  const f = fixture('preflight')
  await assert.rejects(executeRelease(f.driver, context))
  assert.deepEqual(f.calls, ['preflight', 'report'])
  assert.equal(f.report.status, 'failed')
})

test('partial promotion failure restores the compatible prior deployment', async () => {
  const f = fixture('activate')
  await assert.rejects(executeRelease(f.driver, context))
  assert.ok(f.calls.includes('rollback'))
  assert.equal(f.calls.includes('smoke'), false)
})
