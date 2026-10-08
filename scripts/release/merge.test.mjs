import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
test('merge helper projects GitHub history, pins the head, and blocks active releases', () => {
  const folder = mkdtempSync(join(tmpdir(), 'release-merge-'))
  const sha = 'a'.repeat(40)
  const fixture = `#!${process.execPath}\nconst a=process.argv.slice(2);let value;\nif(a[0]==='repo') value={nameWithOwner:'fixture/repo'};\nelse if(a[0]==='pr') {if(a[1]==='merge') require('node:fs').writeFileSync(process.env.MERGE_LOG,JSON.stringify(a));value={};}\nelse if(a[1].endsWith('/pulls/1')) value={state:'open',draft:false,base:{ref:'develop'},head:{sha:'${sha}',ref:'codex/task',repo:{full_name:'fixture/repo'}}};\nelse if(a[1].endsWith('/protection')) value={enforce_admins:{enabled:true},required_pull_request_reviews:{},required_status_checks:{contexts:['ci']}};\nelse if(a[1].includes('/pulls?')) value=[];\nelse if(a[1].includes('/actions/runs?')) {if(!a.includes('--jq')) throw Error('Project large history before returning it');value=process.env.ACTIVE_RELEASE?[{name:'Controlled release',status:'in_progress'}]:[];}\nelse if(a[1].includes('/rules/branches/')) value=[{type:'pull_request',parameters:{allowed_merge_methods:['squash']}}];\nelse throw Error('Unexpected gh operation');\nconsole.log(JSON.stringify(value));\n`
  try {
    writeFileSync(join(folder, 'gh'), fixture, { mode: 0o700 })
    const env = {
      ...process.env,
      PATH: folder,
      MERGE_LOG: join(folder, 'merge.json'),
    }
    const passed = spawnSync(
      process.execPath,
      ['scripts/release/merge.mjs', '1'],
      { env, encoding: 'utf8' },
    )
    assert.equal(passed.status, 0, passed.stderr)
    const args = JSON.parse(readFileSync(env.MERGE_LOG))
    assert.ok(args.includes('--squash'))
    assert.ok(args.includes('--match-head-commit'))
    assert.ok(args.includes(sha))
    assert.ok(!args.includes('--admin'))
    const blocked = spawnSync(
      process.execPath,
      ['scripts/release/merge.mjs', '1'],
      { env: { ...env, ACTIVE_RELEASE: '1' }, encoding: 'utf8' },
    )
    assert.notEqual(blocked.status, 0)
    assert.match(blocked.stderr, /Production release in progress/)
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})
