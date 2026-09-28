import { describe, expect, it } from 'vitest'

import { pageBlocks } from '@/blocks'

type TestField = {
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
  it('adds the shared Appearance group to every page block', () => {
    for (const block of blocks) {
      expect(namedField(block.fields, 'appearance').type, block.slug).toBe('group')
    }
  })

  it('uses two compact per-side spacing rows and one border row', () => {
    const appearance = namedField(blocks[0].fields, 'appearance')
    const spacing = labeledField(appearance.fields || [], 'Spacing')
    const border = labeledField(appearance.fields || [], 'Border')

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
})
