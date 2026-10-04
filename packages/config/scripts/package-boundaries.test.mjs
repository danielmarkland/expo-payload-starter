import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkPackage } from './package-boundaries.mjs'

test('checks relative, alias, re-export, dynamic and undeclared runtime imports', async () => {
  const root = await mkdtemp(join(tmpdir(), 'package-boundaries-'))
  try {
    await mkdir(join(root, 'src'))
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        name: '@example/shared',
        dependencies: { zod: '*' },
        devDependencies: { vitest: '*' },
      }),
    )
    await writeFile(
      join(root, 'src/index.ts'),
      `
      import '../../apps/site/private';
      export * from '@/payload-types';
      export { x } from '@starter/brand';
      import('next/server');
      const test = require('vitest');
      import { z } from 'zod';
    `,
    )
    const errors = await checkPackage(root, { published: true })
    assert.equal(errors.length, 5)
    assert.ok(errors.some((error) => error.includes('escapes package')))
    assert.ok(errors.some((error) => error.includes('application alias')))
    assert.ok(errors.some((error) => error.includes('private application')))
    await writeFile(join(root, 'src/index.ts'), `import { z } from 'zod';`)
    await writeFile(
      join(root, 'src/index.test.ts'),
      `import { test } from 'vitest';`,
    )
    assert.deepEqual(await checkPackage(root), [])
    assert.ok(
      (await checkPackage(root, { allowed: new Set() })).some((error) =>
        error.includes('declaration zod'),
      ),
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
