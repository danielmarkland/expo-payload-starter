import { describe, expect, it } from 'vitest'
import type { FooterContentArea } from '@danielmarkland/publishing-contracts'
import { footerNavigationSchema } from '@danielmarkland/publishing-contracts'
import { moveFooterBlock, footerLatestPostsLimit } from './footerLayout.js'
import {
  migrateFooterNavigation,
  legacyFooterFromSQL,
} from './footerMigration.js'

const layout: FooterContentArea[] = [
  {
    id: 'area',
    columns: [
      {
        id: 'a',
        blocks: [
          { id: 'one', blockType: 'copyright', owner: 'Example' },
          { id: 'two', blockType: 'logo' },
        ],
      },
      { id: 'b', blocks: [] },
    ],
  },
]
describe('footer layout operations', () => {
  it('moves blocks between columns without replacing IDs or settings and leaves the input intact', () => {
    const next = moveFooterBlock(layout, 'one', 'b')
    expect(next[0]?.columns[1]?.blocks).toEqual([
      { id: 'one', blockType: 'copyright', owner: 'Example' },
    ])
    expect(layout[0]?.columns[0]?.blocks).toHaveLength(2)
    expect(
      moveFooterBlock(next, 'one', 'a', 'two')[0]?.columns[0]?.blocks?.map(
        (b) => b.id,
      ),
    ).toEqual(['one', 'two'])
    expect(moveFooterBlock(layout, 'missing', 'a')).toBe(layout)
  })
  it('supports unlimited areas, up to four columns, and independent latest-post limits', () => {
    const areas = Array.from({ length: 8 }, (_, i) => ({
      id: `area-${i}`,
      columns: [{ id: `col-${i}`, blocks: [] }],
    }))
    expect(
      footerNavigationSchema.parse({ contentAreas: areas }).contentAreas,
    ).toHaveLength(8)
    expect(
      footerNavigationSchema.safeParse({
        contentAreas: [{ columns: Array(5).fill({ blocks: [] }) }],
      }).success,
    ).toBe(false)
    expect(
      footerLatestPostsLimit([
        {
          columns: [
            {
              blocks: [
                { blockType: 'latestPosts', limit: 3 },
                { blockType: 'latestPosts', limit: 8 },
              ],
            },
          ],
        },
      ]),
    ).toBe(8)
    expect(footerLatestPostsLimit([])).toBe(0)
  })
})
describe('one-time footer conversion', () => {
  it('preserves every content group, relationship, form option, destination, and disabled state', () => {
    const legacy = legacyFooterFromSQL(
      {
        background: 'dark',
        layout_preset: 'brand-details',
        social_placement: 'details',
        details_alignment: 'end',
        details: 'Service area\nShipping Nationwide',
        tagline: 'Custom buyer description',
        copyright_owner: 'Example Owner',
        newsletter_show: true,
        newsletter_heading: 'Updates',
        newsletter_destination_id: 'editorial',
        newsletter_submit_label: 'Join',
        newsletter_success_message: 'Subscribed',
        newsletter_consent_text: 'Consent',
        newsletter_icon: 'mail',
        newsletter_appearance_padding_top: 'sm',
        contact_form_show: false,
        contact_form_heading: 'Contact',
        contact_form_name_mode: 'separate',
        contact_form_show_company: true,
        contact_form_submit_label: 'Send',
        contact_form_success_message: 'Received',
        latest_posts_show: true,
        latest_posts_limit: 4,
      },
      [{ id: 'link', label: 'About', type: 'page', page_id: 9, new_tab: true }],
      [
        {
          id: 'social',
          label: 'Social',
          url: 'https://example.com',
          icon: 'mail',
          new_tab: true,
        },
      ],
    )
    let index = 0
    const converted = migrateFooterNavigation(
      legacy,
      { siteTitle: 'Example', description: 'Default' },
      () => `id-${++index}`,
    )
    expect(footerNavigationSchema.safeParse(converted).success).toBe(true)
    const blocks = converted.contentAreas!.flatMap((area) =>
      area.columns.flatMap((column) => column.blocks ?? []),
    )
    expect(blocks.find((b) => b.blockType === 'newsletter')).toMatchObject({
      enabled: true,
      destinationId: 'editorial',
      consentText: 'Consent',
      icon: 'mail',
      appearance: { paddingTop: 'sm' },
    })
    expect(blocks.find((b) => b.blockType === 'contactForm')).toMatchObject({
      enabled: false,
      nameMode: 'separate',
      showCompany: true,
      successMessage: 'Received',
    })
    expect(blocks.find((b) => b.blockType === 'links')).toMatchObject({
      items: [{ id: 'link', page: 9, newTab: true }],
    })
    expect(blocks.find((b) => b.blockType === 'socialLinks')).toMatchObject({
      items: [{ id: 'social', icon: 'mail' }],
    })
    expect(blocks.find((b) => b.blockType === 'latestPosts')).toMatchObject({
      limit: 4,
    })
    expect(blocks.find((b) => b.blockType === 'copyright')).toMatchObject({
      owner: 'Example Owner',
    })
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length)
    expect(JSON.stringify(converted)).toContain('Custom buyer description')
    expect(JSON.stringify(converted)).toContain('Shipping Nationwide')
  })
})
