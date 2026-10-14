import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  releaseTarget,
  assertDevDomain,
  assertDeploymentTarget,
} from './target.mjs'
test('development targets custom dev for both release profiles', () => {
  assert.equal(releaseTarget('development', 'platform'), 'dev')
  assert.equal(releaseTarget('production', 'platform'), 'production')
  assert.equal(releaseTarget('development', 'starter'), 'dev')
  assert.throws(() => releaseTarget('preview', 'platform'))
})
test('dev activation rejects production domains, redirects and branch assignments', () => {
  assert.doesNotThrow(() =>
    assertDevDomain(
      { name: 'dev.example.com', customEnvironmentId: 'env_dev' },
      'env_dev',
    ),
  )
  for (const domain of [
    { name: 'prod.example.com' },
    { name: 'dev.example.com', customEnvironmentId: 'env_other' },
    {
      name: 'dev.example.com',
      customEnvironmentId: 'env_dev',
      gitBranch: 'main',
    },
  ])
    assert.throws(() => assertDevDomain(domain, 'env_dev'))
})
test('dev recovery cannot use production deployments', () => {
  assert.throws(() =>
    assertDeploymentTarget(
      { target: 'production' },
      { target: 'dev', customEnvironmentId: 'env_dev' },
    ),
  )
  assert.doesNotThrow(() =>
    assertDeploymentTarget(
      { customEnvironment: { id: 'env_dev' } },
      { target: 'dev', customEnvironmentId: 'env_dev' },
    ),
  )
})

test('dev smoke targets must exercise domains assigned to dev', async () => {
  const { assertDevSmokeTargets } = await import('./target.mjs')
  const domains = [
    { name: 'dev.example.test' },
    { name: '*.apps.example.test' },
  ]
  assert.doesNotThrow(() =>
    assertDevSmokeTargets(
      [
        { url: 'https://dev.example.test/health' },
        { url: 'https://tenant.apps.example.test/' },
      ],
      domains,
    ),
  )
  for (const host of [
    'prod.example.test',
    'apps.example.test',
    'nested.tenant.apps.example.test',
  ])
    assert.throws(
      () => assertDevSmokeTargets([{ url: `https://${host}/` }], domains),
      /outside/,
    )
})
