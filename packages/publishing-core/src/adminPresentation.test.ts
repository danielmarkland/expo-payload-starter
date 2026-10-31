import { describe, expect, it } from 'vitest'
import type { Field } from 'payload'
import { createPagesFields } from './payloadPages.js'
import { createHeaderNavigationFields } from './payloadNavigation.js'
import {
  createAuthorsFields,
  createCategoriesFields,
  createTagsFields,
  createPostsFields,
} from './payloadEditorial.js'
import { createSiteSettingsFields } from './payloadSiteSettings.js'
import { createPublishingFields } from './payloadFields.js'
import { createPublishingBlocks } from './payloadBlocks.js'
import {
  compactBlockSettings,
  compactLinkSettings,
  titleCaseFields,
  publishingAdminPresentation,
} from './adminPresentation.js'

function leaves(fields: Field[], prefix = ''): Map<string, Field> {
  const result = new Map<string, Field>()
  for (const field of fields) {
    const path =
      'name' in field ? `${prefix}${field.name}` : prefix.replace(/\.$/, '')
    if ('name' in field) result.set(path, field)
    if (field.type === 'blocks') {
      for (const block of field.blocks)
        if (typeof block !== 'string')
          for (const [key, value] of leaves(
            block.fields,
            `${path}[${block.slug}].`,
          ))
            result.set(key, value)
    } else if (field.type === 'tabs') {
      for (const tab of field.tabs)
        for (const [key, value] of leaves(
          tab.fields,
          'name' in tab && tab.name ? `${prefix}${tab.name}.` : prefix,
        ))
          result.set(key, value)
    } else if ('fields' in field) {
      for (const [key, value] of leaves(
        field.fields,
        'name' in field ? `${path}.` : prefix,
      ))
        result.set(key, value)
    }
  }
  return result
}

describe('reviewed admin presentation', () => {
  it('retains every field and behavior in the real shared editorial and site schemas', () => {
    const controls = createPublishingFields({
      linkIconOptions: [],
      socialIconOptions: [],
      iconPickerFieldComponent: { Field: '/Icon' },
      linkRowLabel: '/Row',
    })
    const blocks = createPublishingBlocks(controls)
    for (const [slug, fields] of [
      ['pages', createPagesFields(blocks.pageBlocks)],
      ['posts', createPostsFields()],
      ['header-navigation', createHeaderNavigationFields(controls)],
      ['authors', createAuthorsFields()],
      ['categories', createCategoriesFields()],
      ['tags', createTagsFields()],
      [
        'site-settings',
        createSiteSettingsFields({ colorPickerFieldComponent: '/Color' }),
      ],
    ] as const) {
      const before = leaves(fields)
      const config = publishingAdminPresentation()({
        collections: [{ slug, fields }],
      })
      const after = leaves(config.collections![0]!.fields)
      for (const [path, field] of after)
        if (field.type === 'ui') after.delete(path)
      expect([...after.keys()].sort()).toEqual([...before.keys()].sort())
      for (const [path, field] of before) {
        const next = after.get(path)!
        const ignored = new Set([
          'admin',
          'label',
          'labels',
          'fields',
          'blocks',
          'tabs',
        ])
        for (const key of Object.keys(field))
          if (!ignored.has(key))
            expect(
              (next as unknown as Record<string, unknown>)[key],
              `${slug}:${path}:${key}`,
            ).toBe((field as unknown as Record<string, unknown>)[key])
        expect(next.admin?.condition).toBe(field.admin?.condition)
        expect(next.admin?.components).toBe(field.admin?.components)
      }
    }
  })
  it('uses major-area tabs and retains additional settings when regrouping', () => {
    const source = createSiteSettingsFields({
      colorPickerFieldComponent: '/Color',
    })
    const extra: Field = { name: 'extra', type: 'text', required: true }
    const original = source[0]!
    if (original.type !== 'tabs')
      throw new Error('Expected native settings tabs')
    original.tabs.push({ label: 'Extension', fields: [extra] })
    const result = publishingAdminPresentation()({
      collections: [{ slug: 'site-settings', fields: source }],
    })
    const tabs = result.collections![0]!.fields[0]!
    if (tabs.type !== 'tabs') throw new Error('Expected native settings tabs')
    expect(tabs.tabs.map((tab) => tab.label)).toEqual([
      'Site',
      'Design',
      'Typography',
      'Colors',
      'Buttons',
      'Logos',
      'Post Display',
      'Integrations',
      'SEO',
      'Extension',
    ])
    const site = leaves(tabs.tabs[0]!.fields)
    const design = leaves(tabs.tabs[1]!.fields)
    expect(site.has('siteDescription')).toBe(true)
    expect(site.has('archive')).toBe(false)
    expect(
      leaves(tabs.tabs.find((tab) => tab.label === 'Post Display')!.fields).has(
        'archive',
      ),
    ).toBe(true)
    expect(site.has('integrations')).toBe(false)
    expect(
      leaves(tabs.tabs.find((tab) => tab.label === 'Integrations')!.fields).has(
        'integrations',
      ),
    ).toBe(true)
    expect(design.has('lightLogo')).toBe(false)
    expect(
      leaves(tabs.tabs.find((tab) => tab.label === 'Logos')!.fields).has(
        'lightLogo',
      ),
    ).toBe(true)
    expect(design.has('width')).toBe(true)
    expect(design.has('theme')).toBe(true)
    expect(
      leaves(tabs.tabs.find((tab) => tab.label === 'Extension')!.fields).get(
        'extra',
      )?.required,
    ).toBe(true)
    expect(
      tabs.tabs[0]!.fields.filter(
        (field) => field.type === 'collapsible',
      ).every((field) => field.admin?.initCollapsed),
    ).toBe(true)
  })

  it('preserves paths, access, conditions, validation, hooks and components through nested layouts', () => {
    const condition = () => true
    const validate = () => 'Preserved validation'
    const fields: Field[] = [
      {
        type: 'blocks',
        name: 'layout',
        blocks: [
          {
            slug: 'hero',
            fields: [
              {
                name: 'count',
                type: 'number',
                validate,
                admin: { condition, components: { Field: '/Count' } },
              },
              { name: 'size', type: 'number', defaultValue: 12 },
              { name: 'spacing', type: 'number', min: 0 },
              { name: 'body', type: 'richText', required: true },
              {
                name: 'link',
                type: 'group',
                fields: [
                  { name: 'label', type: 'text', required: true },
                  { name: 'type', type: 'select', options: ['url', 'page'] },
                  { name: 'icon', type: 'text' },
                  { name: 'url', type: 'text', admin: { condition } },
                  {
                    name: 'page',
                    type: 'relationship',
                    relationTo: 'pages',
                    admin: { condition },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const before = leaves(fields)
    const after = leaves(titleCaseFields(compactBlockSettings(fields)))
    expect([...after.keys()].sort()).toEqual([...before.keys()].sort())
    for (const [path, field] of before) {
      const output = after.get(path)!
      for (const key of [
        'name',
        'type',
        'required',
        'validate',
        'defaultValue',
        'min',
        'access',
        'hooks',
        'options',
        'relationTo',
      ] as const)
        expect((output as unknown as Record<string, unknown>)[key]).toBe(
          (field as unknown as Record<string, unknown>)[key],
        )
      expect(output.admin?.condition).toBe(field.admin?.condition)
      expect(output.admin?.components).toBe(field.admin?.components)
    }
    expect(before.get('layout[hero].count')?.admin?.width).toBeUndefined()
  })

  it('preserves translated labels, hidden labels, options and authored content', () => {
    const options = [{ label: 'keep this option', value: 'original' }]
    const fields: Field[] = [
      {
        name: 'apiKey',
        label: { en: 'API key', fr: 'clé API' },
        type: 'text',
        defaultValue: 'keep my content',
      },
      { name: 'hiddenLabel', label: false, type: 'text' },
      {
        name: 'headerSize',
        type: 'select',
        options,
        admin: { description: 'keep this description' },
      },
      {
        type: 'tabs',
        tabs: [
          {
            label: { en: 'site settings', fr: 'paramètres du site' },
            fields: [],
          },
        ],
      },
    ]
    const output = titleCaseFields(fields)
    expect(output[0]).toMatchObject({
      label: { en: 'API Key', fr: 'clé API' },
      defaultValue: 'keep my content',
    })
    expect(output[1]).toMatchObject({ label: false })
    expect(output[2]).toMatchObject({
      label: 'Header Size',
      options,
      admin: { description: 'keep this description' },
    })
    expect(output[3]).toMatchObject({
      tabs: [{ label: { en: 'Site Settings', fr: 'paramètres du site' } }],
    })
  })

  it('preserves translated collection labels and dynamic global labels', () => {
    const dynamic = () => 'Localized Header'
    const config = publishingAdminPresentation()({
      collections: [
        {
          slug: 'site-settings',
          fields: [],
          labels: {
            singular: { en: 'Site settings', fr: 'Paramètres' },
            plural: { en: 'Site settings', fr: 'Paramètres' },
          },
        },
      ],
      globals: [{ slug: 'headerNavigation', label: dynamic, fields: [] }],
    })
    expect(config.collections?.[0]?.labels?.singular).toEqual({
      en: 'Site Settings',
      fr: 'Paramètres',
    })
    expect(config.globals?.[0]?.label).toBe(dynamic)
  })

  it('retains guarded rows and unknown link fields', () => {
    const fields: Field[] = [
      {
        type: 'row',
        admin: { condition: () => false },
        fields: [
          { type: 'number', name: 'first' },
          { type: 'number', name: 'second' },
        ],
      },
    ]
    expect(compactBlockSettings(fields, true)[0]).toMatchObject({
      type: 'row',
      admin: fields[0]!.admin,
    })
    expect(
      compactLinkSettings([{ type: 'text', name: 'unknown' }]),
    ).toBeUndefined()
  })

  it('applies after plugins without replacing permissions, drafts or upload settings', () => {
    const access = { read: () => true }
    const versions = { drafts: true as const }
    const result = publishingAdminPresentation()({
      collections: [
        {
          slug: 'posts',
          access,
          versions,
          fields: [{ name: 'publishedAt', type: 'date' }],
        },
      ],
    })
    expect(result).toMatchObject({
      admin: { dateFormat: 'MMM d, yyyy, h:mm a' },
    })
    expect(result.collections?.[0]?.access).toBe(access)
    expect(result.collections?.[0]?.versions).toBe(versions)
    expect(result.collections?.[0]?.admin?.group).toBe('Content')
  })
})
