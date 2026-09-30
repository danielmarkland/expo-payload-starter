import { describe, expect, it } from 'vitest'

import { buttonVariantOptions, pageBlocks } from '@/blocks'
import {
  actionFields,
  linkArrayPresentation,
  linkFields,
  socialLinkFields,
  submitButtonFields,
} from '@/fields/linkFields'

type TestField = {
  admin?: {
    className?: string
    components?: { RowLabel?: string }
    condition?: (data: unknown, siblingData: Record<string, unknown>) => boolean
    description?: string
    initCollapsed?: boolean
    width?: string
  }
  defaultValue?: unknown
  fields?: TestField[]
  label?: string
  name?: string
  options?: Array<{ label: string; value: string }>
  type: string
}

const blocks = pageBlocks as unknown as Array<{ fields: TestField[]; slug: string }>

function namedField(fields: TestField[], name: string): TestField {
  const field = fields.find((candidate) => candidate.name === name)
  if (field) return field
  for (const candidate of fields) {
    if (!candidate.fields) continue
    try {
      return namedField(candidate.fields, name)
    } catch {
      // Continue searching sibling layout fields.
    }
  }
  throw new Error(`Missing ${name} field`)
}

function labeledField(fields: TestField[], label: string): TestField {
  const field = fields.find((candidate) => candidate.label === label)
  if (!field) throw new Error(`Missing ${label} field`)
  return field
}

describe('page-block appearance fields', () => {
  it('uses compact shared rows for link and button editors', () => {
    const linkEditor = linkFields({ required: true }) as TestField[]
    const primaryRow = linkEditor[0]
    expect(primaryRow.type).toBe('row')
    expect(primaryRow.admin?.className).toBe('compact-link-row')
    expect(primaryRow.fields?.map((field) => field.name)).toEqual([
      'label',
      'type',
      'icon',
      'page',
      'post',
      'url',
      'newTab',
      'iconPosition',
    ])
    expect(primaryRow.fields?.map((field) => field.admin?.width)).toEqual([
      '18%',
      '16%',
      '16%',
      '26%',
      '26%',
      '26%',
      '12%',
      '12%',
    ])
    expect(namedField(primaryRow.fields || [], 'url').admin?.description).toBe(
      'Use a relative path, https, mailto, or tel URL.',
    )
    const newTab = namedField(primaryRow.fields || [], 'newTab')
    expect(newTab.admin?.className).toBe('compact-link-row__new-tab')
    expect(newTab.label).toBe('New tab')
    expect(newTab.admin?.condition?.({}, { type: 'url' })).toBe(true)
    expect(newTab.admin?.condition?.({}, { type: 'page' })).toBe(false)
    expect(namedField(primaryRow.fields || [], 'icon').admin?.className).toBe(
      'compact-link-row__icon',
    )

    expect(linkArrayPresentation).toEqual({
      admin: {
        className: 'compact-link-array',
        components: {
          RowLabel: '@/components/admin/LinkRowLabel#LinkRowLabel',
        },
      },
      labels: { plural: 'Links', singular: 'Link' },
    })

    const iconOnlyEditor = linkFields({ allowIconOnly: true }) as TestField[]
    expect(iconOnlyEditor).toHaveLength(1)
    expect(iconOnlyEditor[0]?.fields?.at(-1)?.name).toBe('iconOnly')

    const actionEditor = actionFields('primary-filled') as TestField[]
    expect(actionEditor).toHaveLength(1)
    expect(actionEditor[0]?.fields?.map((field) => field.name)).toEqual([
      'label',
      'type',
      'icon',
      'page',
      'post',
      'url',
      'newTab',
      'iconPosition',
      'variant',
    ])
    expect(namedField(actionEditor, 'variant').admin?.width).toBe('12%')

    const submitEditor = submitButtonFields('primary-filled') as TestField[]
    expect(submitEditor[0]?.fields?.map((field) => field.name)).toEqual([
      'icon',
      'iconPosition',
      'submitButtonVariant',
    ])
    expect(namedField(submitEditor, 'iconPosition').admin?.width).toBe('33%')
    expect(namedField(submitEditor, 'submitButtonVariant').admin?.width).toBe('33%')

    const socialEditor = socialLinkFields() as TestField[]
    expect(socialEditor[0]?.fields?.map((field) => field.name)).toEqual([
      'label',
      'icon',
      'url',
      'newTab',
    ])
    expect(namedField(socialEditor, 'newTab').admin?.width).toBe('15%')
  })

  it('offers four button variants with role-appropriate defaults', () => {
    expect(buttonVariantOptions.map((option) => option.value)).toEqual([
      'primary-filled',
      'primary-outline',
      'secondary-filled',
      'secondary-outline',
    ])

    const hero = blocks.find((block) => block.slug === 'hero')
    const featureGrid = blocks.find((block) => block.slug === 'featureGrid')
    const callToAction = blocks.find((block) => block.slug === 'callToAction')
    const contactForm = blocks.find((block) => block.slug === 'contactForm')
    if (!hero || !featureGrid || !callToAction || !contactForm) {
      throw new Error('Missing action block')
    }

    expect(
      namedField(namedField(hero.fields, 'primaryButton').fields || [], 'variant').defaultValue,
    ).toBe('primary-filled')
    expect(
      namedField(namedField(hero.fields, 'secondaryButton').fields || [], 'variant').defaultValue,
    ).toBe('secondary-outline')
    expect(
      namedField(namedField(featureGrid.fields, 'action').fields || [], 'variant').defaultValue,
    ).toBe('primary-outline')
    expect(
      namedField(namedField(callToAction.fields, 'action').fields || [], 'variant').defaultValue,
    ).toBe('primary-filled')
    expect(namedField(contactForm.fields, 'submitButtonVariant').defaultValue).toBe(
      'primary-filled',
    )
    expect(
      namedField(contactForm.fields, 'submitButtonVariant').options?.map((option) => option.value),
    ).toEqual(buttonVariantOptions.map((option) => option.value))
  })

  it('adds the shared Appearance group to every page block', () => {
    for (const block of blocks) {
      expect(namedField(block.fields, 'appearance').type, block.slug).toBe('group')
    }
  })

  it('uses two compact per-side spacing rows and one border row', () => {
    const appearance = namedField(blocks[0].fields, 'appearance')
    const spacing = labeledField(appearance.fields || [], 'Spacing')
    const border = labeledField(appearance.fields || [], 'Border')

    expect(appearance.fields?.map((field) => field.label)).toEqual([
      'Container and surface',
      'Spacing',
      'Border',
    ])

    expect(spacing.fields?.map((row) => row.fields?.map((field) => field.name))).toEqual([
      ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
      ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    ])
    expect(border.fields?.[0].fields?.map((field) => field.name)).toEqual([
      'borderTop',
      'borderRight',
      'borderBottom',
      'borderLeft',
      'borderWidth',
    ])
  })

  it('offers the approved border treatments and widths', () => {
    const appearance = namedField(blocks[0].fields, 'appearance')
    const border = labeledField(appearance.fields || [], 'Border')
    const borderFields = border.fields?.[0].fields || []

    expect(border.admin?.description).toBe(
      'Width applies to every enabled border side and stays fixed across density presets. Blank uses the 1px default.',
    )

    expect(namedField(borderFields, 'borderLeft').options?.map((option) => option.value)).toEqual([
      'none',
      'default',
      'accent',
    ])
    expect(namedField(borderFields, 'borderWidth').options).toEqual([
      { label: 'Thin (1px)', value: 'thin' },
      { label: 'Medium (2px)', value: 'medium' },
      { label: 'Thick (4px)', value: 'thick' },
    ])
  })

  it('documents the density-scaled spacing values for editors', () => {
    const appearance = namedField(blocks[0].fields, 'appearance')
    const spacing = labeledField(appearance.fields || [], 'Spacing')

    expect(spacing.admin?.description).toBe(
      'Base values: Small 16px, Medium 40px, Large 72px, Extra large 120px. The site density preset scales them.',
    )
  })
})
