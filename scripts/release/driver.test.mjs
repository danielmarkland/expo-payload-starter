import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createDriver } from './engine.mjs'
test('prebuilt deployment verifies metadata and promotes its verified URL', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'release-driver-'))
  const oldFetch = globalThis.fetch
  const context = { sha: 'a'.repeat(40), migrationDigest: 'schema' }
  try {
    writeFileSync(
      join(folder, 'vercel'),
      `#!/bin/sh\nprintf '%s\\n' "$1" >> '${folder}/commands'\nif [ "$1" = deploy ]; then printf '%s\\n' https://unit.vercel.app; fi\n`,
      { mode: 0o700 },
    )
    let altered = false
    globalThis.fetch = async (url) => {
      assert.ok(String(url).includes('/v13/deployments/unit.vercel.app'))
      return Response.json({
        id: 'dpl_fixture',
        meta: {
          releaseSha: altered ? 'b'.repeat(40) : context.sha,
          releaseMigrationDigest: context.migrationDigest,
        },
      })
    }
    const driver = createDriver({
      PATH: folder,
      VERCEL_TOKEN: 'test-token',
      VERCEL_ORG_ID: 'test-org',
      VERCEL_PROJECT_ID: 'test-project',
    })
    const deployment = await driver.deploy(context)
    assert.deepEqual(deployment, {
      id: 'dpl_fixture',
      url: 'https://unit.vercel.app',
    })
    await driver.activate(context, deployment)
    assert.equal(
      readFileSync(join(folder, 'commands'), 'utf8'),
      'deploy\npromote\n',
    )
    altered = true
    await assert.rejects(driver.deploy(context), /identity\/evidence/)
  } finally {
    globalThis.fetch = oldFetch
    rmSync(folder, { recursive: true, force: true })
  }
})
