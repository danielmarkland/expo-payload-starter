import { expect, it } from 'vitest'
import { moveSEOFieldsIntoTabs } from './payloadSEO.js'
import type { Config, Field } from 'payload'

it('moves metadata only into configured SEO tabs for collections and globals', async () => {
  const meta: Field = { name: 'meta', type: 'group', fields: [] }
  const fields: Field[] = [
    { type: 'tabs', tabs: [{ label: 'SEO', fields: [] }] },
    meta,
  ]
  const config: Config = {
    secret: 'test',
    collections: [
      { slug: 'pages', fields },
      { slug: 'other', fields },
    ],
    globals: [
      { slug: 'settings', fields },
      { slug: 'no-tab', fields: [meta] },
    ],
  }
  const result = await moveSEOFieldsIntoTabs(['pages', 'settings', 'no-tab'])(
    config,
  )
  expect(result.collections?.[0].fields).toHaveLength(1)
  expect(result.globals?.[0].fields).toHaveLength(1)
  expect(result.collections?.[1].fields).toBe(fields)
  expect(result.globals?.[1].fields).toEqual([meta])
  expect(fields).toHaveLength(2)
})
