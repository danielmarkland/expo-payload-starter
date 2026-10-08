import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { archiveDigest, compareVersion } from './packages.mjs'
test('immutable comparison ignores compression/tar metadata but detects changed package bytes', () => {
  const root = mkdtempSync(join(tmpdir(), 'release-archive-test-'))
  try {
    mkdirSync(join(root, 'package'))
    writeFileSync(join(root, 'package/index.js'), 'export const version=1')
    writeFileSync(
      join(root, 'package/package.json'),
      JSON.stringify({
        name: 'example',
        dependencies: { one: '1.0.0', two: '2.0.0' },
      }),
    )
    execFileSync('tar', ['-czf', join(root, 'a.tgz'), '-C', root, 'package'])
    writeFileSync(
      join(root, 'package/package.json'),
      JSON.stringify({
        dependencies: { two: '2.0.0', one: '1.0.0' },
        name: 'example',
      }),
    )
    execFileSync('tar', ['-cf', join(root, 'b.tar'), '-C', root, 'package'])
    const digest = archiveDigest(join(root, 'a.tgz'))
    compareVersion(digest, archiveDigest(join(root, 'b.tar')), 'example@1.0.0')
    writeFileSync(join(root, 'package/index.js'), 'export const version=2')
    execFileSync('tar', [
      '-czf',
      join(root, 'changed.tgz'),
      '-C',
      root,
      'package',
    ])
    assert.throws(
      () =>
        compareVersion(
          digest,
          archiveDigest(join(root, 'changed.tgz')),
          'example@1.0.0',
        ),
      /bump/,
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
