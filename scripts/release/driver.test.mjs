import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createDriver } from './engine.mjs'
test('cloud build keeps domains untouched and activates only its verified candidate', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'release-driver-'))
  const oldFetch = globalThis.fetch
  const context = { sha: 'a'.repeat(40), migrationDigest: 'schema' }
  try {
    writeFileSync(
      join(folder, 'vercel'),
      `#!/bin/sh\nprintf '%s\\n' "$*" >> '${folder}/commands'\nif [ "$1" = deploy ]; then printf '%s\\n' https://unit.vercel.app; fi\n`,
      { mode: 0o700 },
    )
    let altered = false
    globalThis.fetch = async (url) => {
      assert.ok(String(url).includes('/v13/deployments/unit.vercel.app'))
      return Response.json({
        id: 'dpl_fixture',
        readyState: 'READY',
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
    await assert.rejects(driver.deploy(context), /No completed cloud build/)
    await driver.build(context)
    const deployment = await driver.deploy(context)
    assert.deepEqual(deployment, {
      id: 'dpl_fixture',
      url: 'https://unit.vercel.app',
    })
    await driver.activate(context, deployment)
    const commands = readFileSync(join(folder, 'commands'), 'utf8')
    assert.match(commands, /deploy --prod --skip-domain/)
    assert.doesNotMatch(commands, /--prebuilt/)
    assert.match(commands, /promote https:\/\/unit.vercel.app/)
    assert.equal(commands.trim().split('\n').length, 2)
    altered = true
    await assert.rejects(driver.deploy(context), /identity\/evidence/)
  } finally {
    globalThis.fetch = oldFetch
    rmSync(folder, { recursive: true, force: true })
  }
})
