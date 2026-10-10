import { describe, expect, it } from 'vitest'
import {
  createPublishingFields,
  validateExternalURL,
  validateSafeURL,
} from './payloadFields.js'
import { createPublishingBlocks } from './payloadBlocks.js'

const options = {
  linkIconOptions: [{ label: 'Arrow', value: 'arrow' }],
  socialIconOptions: [{ label: 'Mail', value: 'mail' }],
  iconPickerFieldComponent: { Field: '/admin/IconPicker#Field' },
  linkRowLabel: '/admin/LinkLabel#RowLabel',
}

describe('Payload publishing definitions', () => {
  it('preserves URL validation without accepting executable or protocol-relative URLs', () => {
    for (const url of [
      '/posts',
      '#contact',
      'https://example.com',
      'mailto:a@example.com',
      'tel:123',
    ]) {
      expect(validateSafeURL(url)).toBe(true)
    }
    for (const url of [
      '//example.com',
      'javascript:alert(1)',
      '',
      '#Invalid',
    ]) {
      expect(validateSafeURL(url)).not.toBe(true)
    }
    expect(validateExternalURL('https://example.com')).toBe(true)
    expect(validateExternalURL('http://example.com')).not.toBe(true)
    expect(validateExternalURL('/posts')).not.toBe(true)
  })

  it('uses explicit admin integration and creates independent fields', () => {
    const first = createPublishingFields(options)
    const second = createPublishingFields({
      ...options,
      linkRowLabel: '/other/RowLabel',
    })
    expect(first.linkArrayPresentation.admin.components.RowLabel).toBe(
      options.linkRowLabel,
    )
    expect(second.linkArrayPresentation.admin.components.RowLabel).toBe(
      '/other/RowLabel',
    )
    const icons = first.iconFields()
    expect(icons[0]).toMatchObject({
      name: 'icon',
      options: options.linkIconOptions,
      admin: { components: options.iconPickerFieldComponent },
    })
    expect(icons[0]).not.toBe(second.iconFields()[0])
    expect(JSON.stringify(first.destinationFields())).toBe(
      JSON.stringify(second.destinationFields()),
    )
    expect(first.destinationFields()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'page', relationTo: 'pages' }),
        expect.objectContaining({ name: 'post', relationTo: 'posts' }),
      ]),
    )
  })

  it('preserves block order and appearance database names', () => {
    const blocks = createPublishingBlocks(createPublishingFields(options))
    expect(blocks.pageBlocks.map(({ slug }) => slug)).toEqual([
      'hero',
      'richText',
      'image',
      'featureGrid',
      'splitContent',
      'linkGrid',
      'portfolioGrid',
      'callToAction',
      'testimonials',
      'logoCloud',
      'contactForm',
      'stats',
      'faq',
      'latestPosts',
    ])
    for (const block of blocks.pageBlocks) {
      expect(block.fields[0]).toMatchObject({ name: 'anchor', type: 'text' })
      expect(block.fields[1]).toMatchObject({ name: 'eyebrow', type: 'text' })
      expect(block.fields.at(-1)).toMatchObject({
        name: 'appearance',
        type: 'group',
      })
    }
    expect(JSON.stringify(blocks.appearanceField())).toContain('"name":"width"')
    expect(blocks.ContactFormBlock.fields[0]).toMatchObject({
      defaultValue: 'contact',
    })
    expect(blocks.HeroBlock.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'heading',
          required: true,
          type: 'richText',
        }),
      ]),
    )
  })
})
