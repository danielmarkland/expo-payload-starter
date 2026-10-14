import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  cpSync,
  statSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseEnv } from 'node:util'
import { spawnSync } from 'node:child_process'
import {
  choices,
  origin,
  runtimeSettings,
  writeManagedEnv,
  secret,
} from './setup-lib.mjs'

test('three choices validate before provisioning and reject remote local origins', () => {
  assert.deepEqual(
    choices({ mode: 'local', name: 'my-starter', email: 'Me@example.test' }),
    { mode: 'local', name: 'my-starter', email: 'me@example.test' },
  )
  assert.throws(() =>
    choices({ mode: 'local', name: '../prod', email: 'me@example.test' }),
  )
  for (const value of [
    'https://remote.test',
    'http://user:secret@localhost:3000',
    'http://localhost:3000/path',
  ])
    assert.throws(() => origin(value, true))
  assert.equal(origin('http://localhost:3000/', true), 'http://localhost:3000')
})
test('runtime contains no platform policy, migration credential or provider requirements', () => {
  const result = runtimeSettings(
    {
      mode: 'local',
      siteURL: 'http://localhost:3000',
      ports: { app: 8081 },
      database: 'postgresql://restricted@localhost/db',
      payloadSecret: secret(),
      authSecret: secret(),
      storage: {
        accessKey: 'access',
        secretKey: 'secret',
        endpoint: 'http://localhost:9000',
        region: 'us-east-1',
      },
    },
    'myapp',
  )
  assert.equal(Object.keys(result).length, 9)
  assert.equal(
    result.AUTH_TRUSTED_ORIGINS,
    'http://localhost:3000,myapp://,http://localhost:8081',
  )
  assert.ok(
    !Object.keys(result).some((k) => /GROOVE|MIGRATION|GOOGLE|DAGSTER/.test(k)),
  )
  assert.notEqual(result.PAYLOAD_SECRET, result.AUTH_SECRET)
})
test('generated files stay private; user overrides and signing keys are not overwritten', () => {
  const root = mkdtempSync(join(tmpdir(), 'starter-private-'))
  try {
    const state = {}
    writeManagedEnv(root, state, '.env', { AUTH_SECRET: 'original' })
    assert.equal(statSync(join(root, '.env')).mode & 0o777, 0o600)
    writeManagedEnv(root, state, '.env', { AUTH_SECRET: 'original' })
    writeFileSync(
      join(root, '.env'),
      'AUTH_SECRET="user-edited"\nOPTIONAL_PROVIDER="preserved"\n',
    )
    assert.throws(
      () => writeManagedEnv(root, state, '.env', { AUTH_SECRET: 'original' }),
      /differs/,
    )
    assert.equal(
      parseEnv(readFileSync(join(root, '.env'), 'utf8')).AUTH_SECRET,
      'user-edited',
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
test('hosted configure-only provisions once, scopes storage and keeps migration access out of runtime', () => {
  const root = mkdtempSync(join(tmpdir(), 'starter-hosted-'))
  try {
    const scripts = join(root, 'packages/config/scripts')
    mkdirSync(scripts, { recursive: true })
    for (const file of ['setup.mjs', 'setup-lib.mjs'])
      cpSync(new URL(file, import.meta.url), join(scripts, file))
    mkdirSync(join(root, 'apps/app'), { recursive: true })
    writeFileSync(
      join(root, 'apps/app/app.config.js'),
      'module.exports={scheme:"testapp"}',
    )
    const bin = join(root, 'bin')
    mkdirSync(bin)
    writeFileSync(join(bin, 'pnpm'), '#!/bin/sh\nexit 0\n', { mode: 0o700 })
    const fake = `#!/usr/bin/env node
import {appendFileSync} from 'node:fs';
const a=process.argv.slice(2);appendFileSync(${JSON.stringify(join(root, 'calls.jsonl'))},JSON.stringify({command:process.argv[1].split('/').pop(),a})+'\\n');
let result={};
if(a[1]==='/users/me/organizations')result={organizations:[{id:'org_fixture'}]};
if(a[1]==='/projects')result={project:{id:'project_fixture'},branch:{id:'branch_fixture'}};
if(a[0]==='connection-string'){console.log('postgresql://owner:private-owner@ep-example.us-east-2.aws.neon.tech/neondb');process.exit()};
if(a[0]==='credentials')result={token_id:'storage-id',s3_secret_access_key:'private-storage',branch_id:'branch_fixture',scopes:['storage:read','storage:write']};
if(a[1]?.endsWith('/storage'))result={enabled:true,s3_endpoint:'https://branch_fixture.storage.neon.tech',region:'us-east-2'};
if(a[1]==='/v11/projects')result={id:'prj_fixture',accountId:'user_fixture',name:'my-starter'};
if(a[1]?.includes('/domains'))result={domains:[{name:'my-starter.vercel.app'}]};
console.log(JSON.stringify(result));`
    for (const command of ['neon', 'vercel'])
      writeFileSync(join(bin, command), fake, { mode: 0o700 })
    const args = [
      join(scripts, 'setup.mjs'),
      '--mode',
      'hosted',
      '--name',
      'my-starter',
      '--email',
      'admin@example.test',
      '--configure-only',
    ]
    const env = { ...process.env, PATH: `${bin}:${process.env.PATH}` }
    const first = spawnSync(process.execPath, args, { env, encoding: 'utf8' })
    assert.equal(first.status, 0, first.stderr)
    const initial = JSON.parse(readFileSync(join(root, '.starter/state.json')))
    const second = spawnSync(process.execPath, args, { env, encoding: 'utf8' })
    assert.equal(second.status, 0, second.stderr)
    const final = JSON.parse(readFileSync(join(root, '.starter/state.json')))
    assert.equal(initial.payloadSecret, final.payloadSecret)
    assert.equal(initial.authSecret, final.authSecret)
    assert.equal(initial.adminPassword, final.adminPassword)
    const calls = readFileSync(join(root, 'calls.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map(JSON.parse)
    assert.equal(calls.filter((c) => c.a[1] === '/projects').length, 1)
    assert.equal(calls.filter((c) => c.a[0] === 'credentials').length, 1)
    assert.equal(calls.filter((c) => c.a[1] === '/v11/projects').length, 1)
    assert.ok(
      calls.find((c) => c.a[0] === 'credentials').a.includes('storage:read'),
    )
    assert.ok(
      calls.find((c) => c.a[0] === 'credentials').a.includes('storage:write'),
    )
    const site = parseEnv(
      readFileSync(join(root, 'apps/site/.env.local'), 'utf8'),
    )
    assert.equal(new URL(site.DATABASE_URL).username, 'starter_runtime')
    assert.ok(new URL(site.DATABASE_URL).hostname.includes('-pooler'))
    assert.equal(site.DATABASE_MIGRATION_URL, undefined)
    assert.deepEqual(
      Object.keys(
        parseEnv(readFileSync(join(root, 'apps/app/.env.local'), 'utf8')),
      ),
      ['EXPO_PUBLIC_SITE_URL'],
    )
    assert.ok(
      !first.stdout.includes('private-owner') &&
        !first.stdout.includes('private-storage') &&
        !first.stdout.includes(initial.adminPassword),
    )
    final.pending = 'storageCredential'
    writeFileSync(join(root, '.starter/state.json'), JSON.stringify(final))
    const failed = spawnSync(process.execPath, args, { env, encoding: 'utf8' })
    assert.equal(failed.status, 1)
    assert.match(failed.stderr, /unknown outcome/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
