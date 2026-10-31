import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { ClientField } from 'payload'

const state = vi.hoisted(() => ({
  document: {} as Record<string, unknown>,
  group: vi.fn(),
}))
vi.mock('@payloadcms/ui', () => ({
  useDocumentInfo: () => state.document,
  useOperation: () => 'update',
  GroupField: (props: unknown) => {
    state.group(props)
    return null
  },
}))
import { findTheme, ThemeSection, themeSectionFields } from './ThemeSection.js'

const fields = [
  { type: 'row', fields: [{ type: 'select', name: 'defaultMode' }] },
  {
    type: 'collapsible',
    label: 'Typography',
    fields: [{ type: 'text', name: 'headingFont' }],
  },
  {
    type: 'collapsible',
    label: 'Palettes',
    fields: [
      {
        type: 'group',
        name: 'light',
        fields: [{ type: 'text', name: 'primary' }],
      },
    ],
  },
] as ClientField[]
const config = {
  slug: 'site-settings',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Design',
          fields: [
            { name: 'theme', type: 'group', fields, admin: { hidden: true } },
          ],
        },
      ],
    },
  ],
}
afterEach(() => {
  cleanup()
  state.group.mockClear()
})

describe('theme area native field binding', () => {
  it('keeps the canonical group schema path across unnamed tab layouts', () => {
    expect(
      findTheme(config.fields as ClientField[], config.slug)?.schemaPath,
    ).toBe('site-settings._index-0-0.theme')
    const selected = themeSectionFields(fields, 'Colors')
    expect(selected).toHaveLength(fields.length)
    expect(selected[0]?.admin?.hidden).toBe(true)
    expect(selected[1]?.admin?.hidden).toBe(true)
    expect(selected[2]).toMatchObject({
      type: 'group',
      fields: fields[2] && 'fields' in fields[2] ? fields[2].fields : [],
    })
    expect(fields[2]?.type).toBe('collapsible')
  })
  it('delegates rendering with the real group path and nested permissions', () => {
    const permissions = {
      read: true,
      update: false,
      fields: { headingFont: { read: false } },
    }
    state.document = {
      docConfig: config,
      docPermissions: { fields: { theme: permissions } },
    }
    render(
      <ThemeSection
        section="Typography"
        field={{ name: 'mirror', type: 'ui' }}
        path="mirror"
      />,
    )
    expect(state.group).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'theme',
        schemaPath: 'site-settings._index-0-0.theme',
        permissions,
        readOnly: true,
      }),
    )
  })
  it('does not render a theme the principal cannot read', () => {
    state.document = {
      docConfig: config,
      docPermissions: { fields: { theme: { read: false } } },
    }
    render(
      <ThemeSection
        section="Colors"
        field={{ name: 'mirror', type: 'ui' }}
        path="mirror"
      />,
    )
    expect(state.group).not.toHaveBeenCalled()
  })
  it('respects a locked document even with update permission', () => {
    state.document = {
      docConfig: config,
      documentIsLocked: true,
      docPermissions: { fields: { theme: { read: true, update: true } } },
    }
    render(
      <ThemeSection
        section="Design"
        field={{ name: 'mirror', type: 'ui' }}
        path="mirror"
      />,
    )
    expect(state.group).toHaveBeenCalledWith(
      expect.objectContaining({ readOnly: true }),
    )
  })
})
