import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
const check = (branch, enabled, canonical) =>
  spawnSync(process.execPath, ['scripts/release/preview.mjs'], {
    env: {
      ...process.env,
      VERCEL_GIT_COMMIT_REF: branch,
      RELEASE_AUTOMATION_ENABLED: enabled,
      RELEASE_CANONICAL_PREVIEW: canonical,
    },
  }).status
test('handover keeps tracked deployment until enabled; only canonical feature preview builds', () => {
  assert.equal(check('develop', '', 'false'), 1)
  assert.equal(check('main', 'true', 'true'), 0)
  assert.equal(check('develop', 'true', 'true'), 0)
  assert.equal(check('codex/task', 'true', 'true'), 1)
  assert.equal(check('codex/task', '', 'false'), 0)
})
