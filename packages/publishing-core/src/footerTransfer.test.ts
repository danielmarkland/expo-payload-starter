import { describe, expect, it } from 'vitest'
import { createFooterNavigationFields } from './payloadNavigation.js'
import { createPublishingFields } from './payloadFields.js'
import { createPublishingBlocks } from './payloadBlocks.js'
import { projectState } from './siteTransfer/fields.js'
import { describeDesignFields } from './designCapabilities.js'

describe('portable footer content areas', () => {
  it('exports native relationships at their new nested paths and describes every component', () => {
    const links = createPublishingFields({
      linkIconOptions: [],
      socialIconOptions: [],
      iconPickerFieldComponent: {},
      linkRowLabel: '/label',
    })
    const { appearanceField } = createPublishingBlocks(links)
    const fields = createFooterNavigationFields({ ...links, appearanceField })
    const input = {
      title: 'Example',
      background: 'dark',
      contentAreas: [
        {
          title: 'Area',
          columns: [
            {
              alignment: 'start',
              blocks: [
                {
                  blockType: 'links',
                  items: [{ label: 'About', type: 'page', page: 7 }],
                },
                {
                  blockType: 'newsletter',
                  heading: 'Updates',
                  submitLabel: 'Join',
                  successMessage: 'Joined',
                  destinationId: 'news',
                },
              ],
            },
          ],
        },
      ],
    }
    const state = projectState(
      input,
      fields,
      (resource, id) => `${resource}:${id}`,
      [],
      true,
    )
    expect(state.references).toContainEqual({
      path: ['contentAreas', 0, 'columns', 0, 'blocks', 0, 'items', 0, 'page'],
      target: 'pages:7',
    })
    expect(JSON.stringify(state.data)).toContain('news')
    const areas = describeDesignFields(fields).find(
      (f) => f.name === 'contentAreas',
    )
    expect(areas?.maxRows).toBeUndefined()
    const columns = areas?.fields?.find((f) => f.name === 'columns')
    expect(columns?.maxRows).toBe(4)
    expect(
      columns?.fields
        ?.find((f) => f.name === 'blocks')
        ?.blocks?.map((b) => b.slug),
    ).toEqual([
      'logo',
      'text',
      'links',
      'socialLinks',
      'callToAction',
      'latestPosts',
      'copyright',
      'newsletter',
      'contactForm',
    ])
  })
})
