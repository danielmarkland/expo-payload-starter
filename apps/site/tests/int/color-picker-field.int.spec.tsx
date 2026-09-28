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
    const theme = SiteSettings.fields.find(
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
})
