import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
const require = createRequire(import.meta.url)
const patch = require('../../tooling/payload-list-actions.cjs') as (
  source: string,
) => string
it('patches the pinned native bundle exactly and fails closed on upstream signature changes', () => {
  const source = readFileSync(require.resolve('@payloadcms/ui'), 'utf8')
  const result = patch(source)
  expect(result).toContain(
    'buttonStyle:"primary",className:`${QQ}__create-new-button`',
  )
  expect(result).toContain(
    'icon:"plus",to:r,children:s.language==="en"?"New "+qQ(l,s)',
  )
  expect(result).toContain('i("general:createNewLabel",{label:qQ(l,s)})')
  expect(() => patch('updated bundle')).toThrow(
    'Payload list action integration changed',
  )
  expect(() => patch(source + source)).toThrow(
    'Payload list action integration changed',
  )
})
