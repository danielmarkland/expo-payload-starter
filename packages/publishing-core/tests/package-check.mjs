import { access, readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('all published entry points have built output before packing', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'))
  assert.equal(manifest.exports['./*'], undefined)
  for (const [name, entry] of Object.entries(manifest.exports)) {
    const paths = typeof entry === 'string' ? [entry] : Object.values(entry)
    for (const path of paths) {
      assert.ok(path.startsWith('./dist/') || path.startsWith('./src/'), name)
      await access(path)
    }
  }
})
