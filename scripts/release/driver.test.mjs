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
    writeFileSync(
      join(folder, 'pnpm'),
      `#!/bin/sh\nprintf 'pnpm %s\\n' "$*" >> '${folder}/commands'\nif [ "$PACKAGE_BUILD_FAIL" = yes ]; then exit 1; fi\n`,
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
    assert.equal(commands.trim().split('\n').length, 3)
    assert.match(
      commands.split('\n')[0],
      /pnpm --filter \.\/packages\/\*\* build/,
    )
    const failing = createDriver({
      PATH: folder,
      VERCEL_TOKEN: 'test-token',
      PACKAGE_BUILD_FAIL: 'yes',
    })
    await assert.rejects(failing.build(context), /pnpm failed/)
    assert.equal(
      readFileSync(join(folder, 'commands'), 'utf8').trim().split('\n').length,
      4,
    )
    altered = true
    await assert.rejects(driver.deploy(context), /identity\/evidence/)
  } finally {
    globalThis.fetch = oldFetch
    rmSync(folder, { recursive: true, force: true })
  }
})

test('production settings pull omits branch selector and does not import sensitive placeholders', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'release-preflight-'))
  const oldCwd = process.cwd()
  const oldFetch = globalThis.fetch
  try {
    process.chdir(folder)
    writeFileSync(
      join(folder, 'vercel'),
      `#!/bin/sh\nprintf '%s\\n' "$*" >> commands\nprintf '%s\\n' 'GROOVEPOST_ENVIRONMENT=development' 'DATABASE_URL="[SENSITIVE]"' 'PAYLOAD_SECRET="[SENSITIVE]"' > .vercel/.env.production.local\n`,
      { mode: 0o700 },
    )
    globalThis.fetch = async () =>
      Response.json({ link: { productionBranch: 'develop' } })
    const env = {
      PATH: folder,
      RELEASE_PROFILE: 'platform',
      VERCEL_TOKEN: 'test-token',
      VERCEL_ORG_ID: 'test-org',
      VERCEL_PROJECT_ID: 'test-project',
      DATABASE_MIGRATION_URL: 'postgresql://migration:fixture@localhost/db',
      SITE_URL: 'https://unit.example',
      RELEASE_SMOKE_TARGETS: JSON.stringify([
        { url: 'https://unit.example', status: 200, contains: 'fixture' },
      ]),
    }
    await createDriver(env).preflight({
      environment: 'development',
      sha: 'a'.repeat(40),
    })
    const commands = readFileSync(join(folder, 'commands'), 'utf8')
    assert.match(commands, /--environment production/)
    assert.doesNotMatch(commands, /--git-branch/)
    assert.equal(env.DATABASE_URL, undefined)
    assert.match(env.PAYLOAD_SECRET, /^[0-9a-f]{64}$/)
    assert.equal(env.SITE_URL, 'https://unit.example')
  } finally {
    process.chdir(oldCwd)
    globalThis.fetch = oldFetch
    rmSync(folder, { recursive: true, force: true })
  }
})
