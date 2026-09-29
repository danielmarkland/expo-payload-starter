import { describe, expect, it } from 'vitest'

import { buttonVariantOptions, pageBlocks } from '@/blocks'

type TestField = {
  admin?: { description?: string; initCollapsed?: boolean }
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
  if (!field) throw new Error(`Missing ${name} field`)
  return field
}

function labeledField(fields: TestField[], label: string): TestField {
  const field = fields.find((candidate) => candidate.label === label)
  if (!field) throw new Error(`Missing ${label} field`)
  return field
}

describe('page-block appearance fields', () => {
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
    if (!hero || !featureGrid || !callToAction) throw new Error('Missing action block')

    expect(
      namedField(namedField(hero.fields, 'primaryButton').fields || [], 'variant').defaultValue,
    ).toBe('primary-filled')
    expect(
      namedField(namedField(hero.fields, 'secondaryButton').fields || [], 'variant').defaultValue,
    ).toBe('secondary-outline')
    expect(
      namedField(namedField(featureGrid.fields, 'action').fields || [], 'variant').defaultValue,
    ).toBe('primary-outline')
    expect(namedField(callToAction.fields, 'buttonVariant').defaultValue).toBe('primary-filled')
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
