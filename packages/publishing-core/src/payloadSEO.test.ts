import { expect, it } from 'vitest'
import { compactSEOFields, moveSEOFieldsIntoTabs } from './payloadSEO.js'
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

it('retains native SEO controls, callbacks, localization and extra fields through the two-row layout', () => {
  const validate = () => true
  const components = {
    Field: {
      path: '@payloadcms/plugin-seo/client#MetaTitleComponent',
      clientProps: { hasGenerateTitleFn: true },
    },
  }
  const overview: Field = { name: 'overview', type: 'ui' }
  const title: Field = {
    name: 'title',
    type: 'text',
    localized: true,
    validate,
    admin: { components },
  }
  const description: Field = {
    name: 'description',
    type: 'textarea',
    localized: true,
    validate,
    admin: {
      components: {
        Field: '@payloadcms/plugin-seo/client#MetaDescriptionComponent',
      },
    },
  }
  const image: Field = {
    name: 'image',
    type: 'upload',
    relationTo: 'media',
    localized: true,
    admin: {
      components: { Field: '@payloadcms/plugin-seo/client#MetaImageComponent' },
    },
  }
  const extra: Field = { name: 'canonical', type: 'text' }
  const preview: Field = { name: 'preview', type: 'ui' }
  const fields = [overview, title, description, image, extra, preview]
  const result = compactSEOFields(fields)
  expect(result[0]).toBe(preview)
  expect(result[1]).toBe(overview)
  expect(result.at(-1)).toBe(extra)
  const controls = result
    .filter((field) => field.type === 'row')
    .flatMap((field) => ('fields' in field ? field.fields : []))
  for (const [index, original] of [title, image, description].entries()) {
    expect(controls[index]).toMatchObject({
      ...original,
      required: true,
      admin: { ...original.admin, width: '50%' },
    })
    expect(controls[index]!.admin?.components?.Field).toBe(
      original.admin?.components?.Field,
    )
  }
  expect(controls[1]!.admin).toMatchObject({
    description: expect.stringContaining('1200 × 630'),
    components: {
      Label: {
        path: '@danielmarkland/publishing-ui/admin/SEOMetaImageLabel#SEOMetaImageLabel',
      },
    },
  })
  expect(controls[0]!.admin?.components).toBe(components)
  expect(compactSEOFields(result)).toEqual(result)
  expect(fields).toEqual([overview, title, description, image, extra, preview])
})

it('does not restyle unrelated metadata groups or drop controls when no SEO image is configured', () => {
  const plain: Field[] = [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
  ]
  expect(compactSEOFields(plain)).toBe(plain)
  const title: Field = {
    name: 'title',
    type: 'text',
    admin: {
      components: { Field: '@payloadcms/plugin-seo/client#MetaTitleComponent' },
    },
  }
  expect(compactSEOFields([title, plain[1]!])).toMatchObject([
    { type: 'row', fields: [{ name: 'title' }] },
    { type: 'row', fields: [{ name: 'description' }] },
  ])
})
