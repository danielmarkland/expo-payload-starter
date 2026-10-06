import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { TextFieldClientProps } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

const fieldState = vi.hoisted(() => ({
  disabled: false,
  setValue: vi.fn(),
  showError: false,
  value: '#eec784',
}))

vi.mock('@payloadcms/ui', () => ({
  FieldDescription: ({ description }: { description?: string }) => <div>{description}</div>,
  FieldError: () => null,
  FieldLabel: ({ htmlFor, label }: { htmlFor?: string; label?: string }) => (
    <label htmlFor={htmlFor}>{label}</label>
  ),
  useField: () => fieldState,
}))

vi.mock('@payloadcms/ui/shared', () => ({
  mergeFieldStyles: (field: TextFieldClientProps['field']) => ({
    '--field-width': field.admin?.width,
  }),
}))

import { ColorPickerField } from '@/components/admin/ColorPickerField'
import { SiteSettings } from '@/globals/SiteSettings'
import { Pages } from '@/collections/Pages'
import payloadConfig from '@/payload.config'

const field = {
  admin: { width: '25%' },
  label: 'Primary',
  name: 'primary',
  required: true,
  type: 'text',
} as TextFieldClientProps['field']

describe('Payload color picker field', () => {
  afterEach(() => {
    cleanup()
    fieldState.disabled = false
    fieldState.setValue.mockReset()
    fieldState.showError = false
    fieldState.value = '#eec784'
  })

  it('renders the stored color and updates Payload form state', () => {
    render(<ColorPickerField field={field} path="theme.light.primary" />)

    const picker = screen.getByLabelText<HTMLInputElement>('Primary')
    expect(picker.type).toBe('color')
    expect(picker.value).toBe('#eec784')
    expect(screen.getByText('#eec784')).not.toBeNull()
    expect(picker.closest('.color-picker-field')?.getAttribute('style')).toContain(
      '--field-width: 25%',
    )

    fireEvent.change(picker, { target: { value: '#AABBCC' } })
    expect(fieldState.setValue).toHaveBeenCalledWith('#aabbcc')
  })

  it('honors disabled and read-only states', () => {
    fieldState.disabled = true
    const { rerender } = render(<ColorPickerField field={field} path="theme.light.primary" />)
    expect(screen.getByLabelText<HTMLInputElement>('Primary').disabled).toBe(true)

    fieldState.disabled = false
    rerender(<ColorPickerField field={field} path="theme.light.primary" readOnly />)
    expect(screen.getByLabelText<HTMLInputElement>('Primary').disabled).toBe(true)
  })

  it('uses the picker for every palette color without changing hex validation', () => {
    const tabs = SiteSettings.fields.find((candidate) => candidate.type === 'tabs')
    expect(tabs).toMatchObject({
      tabs: [
        { label: 'General' },
        { label: 'Branding' },
        { label: 'Appearance' },
        { label: 'Archives' },
        { label: 'Integrations' },
        { label: 'SEO' },
      ],
      type: 'tabs',
    })
    if (!tabs || tabs.type !== 'tabs') throw new Error('Site settings tabs are missing')

    const generalTab = tabs.tabs.find((tab) => tab.label === 'General')
    const brandingTab = tabs.tabs.find((tab) => tab.label === 'Branding')
    const seoTab = tabs.tabs.find((tab) => tab.label === 'SEO')
    const appearanceTab = tabs.tabs.find((tab) => tab.label === 'Appearance')
    expect(generalTab?.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'siteTitle' })]),
    )
    expect(brandingTab?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'lightLogo' }),
        expect.objectContaining({ name: 'favicon' }),
      ]),
    )
    expect(seoTab?.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'siteDescription' })]),
    )
    for (const tab of tabs.tabs.filter((candidate) => candidate.label !== 'SEO')) {
      expect(tab.fields).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'siteDescription' })]),
      )
    }

    const theme = appearanceTab?.fields.find(
      (candidate) => 'name' in candidate && candidate.name === 'theme',
    )
    expect(theme).toMatchObject({ type: 'group' })
    if (!theme || theme.type !== 'group') throw new Error('Theme group is missing')

    const palettes = theme.fields.filter(
      (candidate) =>
        'name' in candidate &&
        (candidate.name === 'light' || candidate.name === 'dark') &&
        candidate.type === 'group',
    )
    expect(palettes).toHaveLength(2)

    for (const palette of palettes) {
      if (palette.type !== 'group') throw new Error('Palette group is missing')
      expect(palette.fields).toHaveLength(1)
      const row = palette.fields[0]
      expect(row).toMatchObject({ type: 'row' })
      if (row.type !== 'row') throw new Error('Palette row is missing')
      expect(row.fields).toHaveLength(8)
      expect(row.fields).toContainEqual(
        expect.objectContaining({ name: 'accent', label: 'Accent' }),
      )
      for (const color of row.fields) {
        if (color.type !== 'text' || color.hasMany) throw new Error('Color field is invalid')
        expect(color.admin?.components?.Field).toBe(
          '@/components/admin/ColorPickerField#ColorPickerField',
        )
        expect(color.admin?.description).toBeUndefined()
        expect(color.admin?.width).toBe('25%')
        expect(color.validate?.('#abcdef', {} as never)).toBe(true)
        expect(color.validate?.('red', {} as never)).toMatch(/six-digit hex color/)
      }
    }
  })

  it('keeps the SEO plugin group inside the final SEO tab', async () => {
    const config = await payloadConfig
    const siteSettings = config.globals?.find((global) => global.slug === 'siteSettings')
    const tabs = siteSettings?.fields.find((candidate) => candidate.type === 'tabs')
    expect(tabs?.type).toBe('tabs')
    if (!tabs || tabs.type !== 'tabs') throw new Error('Site settings tabs are missing')

    expect(tabs.tabs.map((tab) => tab.label)).toEqual([
      'General',
      'Branding',
      'Appearance',
      'Archives',
      'Integrations',
      'SEO',
    ])
    const seoTab = tabs.tabs.find((tab) => tab.label === 'SEO')
    expect(seoTab?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'siteDescription' }),
        expect.objectContaining({ name: 'meta', label: 'SEO', type: 'group' }),
      ]),
    )
    for (const tab of tabs.tabs.filter((candidate) => candidate.label !== 'SEO')) {
      expect(tab.fields).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'meta' })]),
      )
      expect(tab.fields).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'siteDescription' })]),
      )
    }
    const outsideTabFields = siteSettings?.fields.filter((field) => field.type !== 'tabs') ?? []
    expect(outsideTabFields).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'meta' })]),
    )
    expect(outsideTabFields).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'siteDescription' })]),
    )
  })

  it('organizes the page editor into General, Layout, and SEO tabs', async () => {
    const config = await payloadConfig
    const pages = config.collections?.find((collection) => collection.slug === 'pages')
    const tabs = pages?.fields.find((candidate) => candidate.type === 'tabs')

    expect(tabs?.type).toBe('tabs')
    if (!tabs || tabs.type !== 'tabs') throw new Error('Page editor tabs are missing')

    expect(tabs.tabs.map((tab) => tab.label)).toEqual(['General', 'Layout', 'SEO'])
    const generalTab = tabs.tabs.find((tab) => tab.label === 'General')
    const layoutTab = tabs.tabs.find((tab) => tab.label === 'Layout')
    const seoTab = tabs.tabs.find((tab) => tab.label === 'SEO')

    expect(generalTab?.fields.map((field) => ('name' in field ? field.name : undefined))).toEqual([
      'title',
      'slug',
    ])
    expect(layoutTab?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'layout', type: 'blocks' }),
        expect.objectContaining({ label: 'Advanced presentation', type: 'collapsible' }),
      ]),
    )
    expect(seoTab?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'meta', label: 'SEO', type: 'group' }),
      ]),
    )
    expect(pages?.fields.filter((field) => 'name' in field && field.name === 'meta')).toEqual([])

    const posts = config.collections?.find((collection) => collection.slug === 'posts')
    expect(posts?.fields.some((field) => field.type === 'tabs')).toBe(false)
    expect(Pages.fields[0]).toMatchObject({ type: 'tabs' })
  })
})
