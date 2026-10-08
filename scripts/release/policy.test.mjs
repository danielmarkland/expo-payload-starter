import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertPullRequest,
  assertSHA,
  documentationOnly,
  requireDevelopmentDeployment,
} from './policy.mjs'
const event = (base, head, repo = 'owner/repo') => ({
  pull_request: {
    base: { ref: base },
    head: { ref: head, repo: { full_name: repo } },
  },
})
test('only same-repository develop can release to main', () => {
  assertPullRequest(event('main', 'develop'), 'owner/repo')
  for (const bad of [
    event('main', 'feature'),
    event('main', 'develop', 'other/repo'),
    event('legacy', 'feature'),
  ])
    assert.throws(() => assertPullRequest(bad, 'owner/repo'))
  assertPullRequest(event('develop', 'codex/task'), 'owner/repo')
})
test('documentation fast path cannot hide executable/package/workflow changes', () => {
  assert.equal(
    documentationOnly(['README.md', 'docs/release.md', 'AGENTS.md']),
    true,
  )
  for (const paths of [
    [],
    ['.github/workflows/check.yml'],
    ['docs/run.js'],
    ['packages/ui/README.md'],
    ['.changeset/version.md'],
    ['README.md', 'src/main.ts'],
  ])
    assert.equal(documentationOnly(paths), false)
})
test('exact SHAs prevent shell/ref ambiguity', () => {
  assert.equal(assertSHA('a'.repeat(40)), 'a'.repeat(40))
  for (const bad of ['main', '--help', 'a'.repeat(39), '$(print secret)'])
    assert.throws(() => assertSHA(bad))
})

test('release requires successful deployment of the exact develop commit; stale or failed evidence is rejected', async () => {
  const pr = event('main', 'develop')
  pr.pull_request.head.sha = 'a'.repeat(40)
  await requireDevelopmentDeployment(
    pr,
    'owner/repo',
    true,
    'test-token',
    async (url) =>
      Response.json(
        url.includes('/statuses')
          ? [{ state: 'success' }]
          : [{ id: 1, sha: 'a'.repeat(40), environment: 'development' }],
      ),
  )
  await assert.rejects(
    requireDevelopmentDeployment(
      pr,
      'owner/repo',
      true,
      'test-token',
      async () =>
        Response.json([
          { id: 1, sha: 'b'.repeat(40), environment: 'development' },
        ]),
    ),
  )
  await assert.rejects(
    requireDevelopmentDeployment(
      pr,
      'owner/repo',
      true,
      'test-token',
      async (url) =>
        Response.json(
          url.includes('/statuses')
            ? [{ state: 'failure' }]
            : [{ id: 1, sha: 'a'.repeat(40), environment: 'development' }],
        ),
    ),
  )
})
