import { describe, expect, it } from 'vitest'
import {
  describeDesignFields,
  describeDesignResources,
  validateDesignRecords,
} from './designCapabilities.js'
import { createPublishingFields } from './payloadFields.js'
import { createPublishingBlocks } from './payloadBlocks.js'
import { createHeroHeadline } from './heroHeadline.js'
import { encodeSiteArchive, validateSiteArchive } from './siteTransfer.js'
import { projectState } from './siteTransfer/fields.js'
import type { SiteTransferManifest } from '@danielmarkland/publishing-contracts/siteTransfer'
const links = createPublishingFields({
  linkIconOptions: [],
  socialIconOptions: [],
  iconPickerFieldComponent: {},
  linkRowLabel: 'Row',
})
const blocks = createPublishingBlocks(links)
const resources = [
  {
    key: 'pages',
    slug: 'pages',
    kind: 'collection' as const,
    drafts: true,
    fields: [
      { name: 'title', type: 'text' as const, required: true },
      { name: 'layout', type: 'blocks' as const, blocks: blocks.pageBlocks },
    ],
  },
]
function manifest(layout: unknown[]): SiteTransferManifest {
  const current = {
    data: {
      title: 'Design',
      layout,
    } as SiteTransferManifest['records'][number]['current']['data'],
    references: [],
  }
  return {
    format: 'publishing-site',
    version: 1,
    createdAt: '2026-10-05T00:00:00Z',
    resources: ['pages'],
    extensions: {},
    assets: [],
    records: [
      {
        key: 'pages:home',
        resource: 'pages',
        draft: false,
        current,
        published: current,
      },
    ],
  }
}
describe('portable design capabilities', () => {
  it('describes all blocks, flattening UI-only containers without leaking hooks', () => {
    const result = describeDesignResources(resources)
    expect(result[0].fields[1].blocks).toHaveLength(14)
    expect(JSON.stringify(result)).not.toContain('editor')
    const feature = result[0].fields[1].blocks!.find(
      (b) => b.slug === 'featureGrid',
    )!
    expect(feature.fields.find((f) => f.name === 'layout')).toMatchObject({
      defaultValue: 'cards',
      options: ['cards', 'stacked', 'plain', 'process'],
    })
    expect(
      describeDesignFields([
        {
          type: 'tabs',
          tabs: [{ name: 'theme', fields: [{ name: 'mode', type: 'text' }] }],
        },
      ])[0].fields![0].name,
    ).toBe('mode')
  })
  it('reports required content and enum errors with record and field paths', () => {
    const errors = validateDesignRecords(
      manifest([
        {
          blockType: 'featureGrid',
          heading: 'Features',
          layout: 'invented',
          items: [{ title: 'One' }],
        },
      ]),
      describeDesignResources(resources),
    )
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          record: 'pages:home',
          path: 'current.data.layout.0.layout',
        }),
        expect.objectContaining({
          path: 'current.data.layout.0.items.0.description',
        }),
      ]),
    )
  })
  it('rejects malformed feature rule colors in portable designs', () => {
    const diagnostics = validateDesignRecords(
      manifest([
        {
          blockType: 'featureGrid',
          heading: 'Steps',
          layout: 'plain',
          items: [
            { title: 'Research', description: 'Details', ruleColor: 'green' },
          ],
        },
      ]),
      describeDesignResources(resources),
    )
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'current.data.layout.0.items.0.ruleColor',
          message: 'Expected a six-digit hex color',
        }),
      ]),
    )
  })
  it('rejects unknown fields, blocks, duplicate identity and malformed rich text', () => {
    expect(
      validateDesignRecords(
        manifest([{ blockType: 'made-up' }]),
        describeDesignResources(resources),
      )[0].message,
    ).toContain('Unsupported block')
    expect(
      validateDesignRecords(
        manifest([{ blockType: 'hero', heading: { root: {} } }]),
        describeDesignResources(resources),
      ).length,
    ).toBeGreaterThan(0)
    expect(
      validateDesignRecords(
        manifest([{ blockType: 'stats', unexpected: true }]),
        describeDesignResources(resources),
      )[0].message,
    ).toContain('Unsupported field')
  })
  it('round trips hero accent metadata through the shipped archive validator', () => {
    const site = manifest([
      {
        blockType: 'hero',
        heading: createHeroHeadline('Hello world', ['world']),
      },
    ])
    const state = projectState(
      site.records[0].current.data,
      resources[0].fields,
      () => {
        throw new Error('No references expected')
      },
      [],
      true,
    )
    site.records[0].current = state
    site.records[0].published = state
    const bytes = encodeSiteArchive({ manifest: site, assets: new Map() })
    expect(validateSiteArchive(bytes, { resources }).manifest).toEqual(site)
    expect(
      validateDesignRecords(site, describeDesignResources(resources)),
    ).toEqual([])
  })
  it('describes and validates declared text length constraints', () => {
    const fields = [{ name: 'title', type: 'text' as const, maxLength: 12 }]
    expect(describeDesignFields(fields)[0].maxLength).toBe(12)
    const site = manifest([])
    site.records[0].current.data.title = 'This title is too long'
    delete site.records[0].current.data.layout
    expect(
      validateDesignRecords(
        site,
        describeDesignResources([{ ...resources[0], fields }]),
      )[0].message,
    ).toContain('text length')
  })
})
