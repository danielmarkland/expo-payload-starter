import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { TextFieldClientProps } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useFieldOptions = vi.hoisted(() => vi.fn())
const fieldState = vi.hoisted(() => ({
  disabled: false,
  setValue: vi.fn(),
  showError: false,
  value: '#eec784',
}))

vi.mock('@payloadcms/ui', () => ({
  FieldDescription: ({ description }: { description?: string }) => (
    <div>{description}</div>
  ),
  FieldError: () => null,
  FieldLabel: ({ htmlFor, label }: { htmlFor?: string; label?: string }) => (
    <label htmlFor={htmlFor}>{label}</label>
  ),
  useField: (options: unknown) => {
    useFieldOptions(options)
    return fieldState
  },
}))

vi.mock('@payloadcms/ui/shared', () => ({
  mergeFieldStyles: (field: TextFieldClientProps['field']) => ({
    '--field-width': field.admin?.width,
  }),
}))

import { ColorPickerField } from './admin/ColorPickerField.js'

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
    useFieldOptions.mockClear()
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
    expect(
      picker.closest('.color-picker-field')?.getAttribute('style'),
    ).toContain('--field-width: 25%')

    fireEvent.change(picker, { target: { value: '#AABBCC' } })
    expect(fieldState.setValue).toHaveBeenCalledWith('#aabbcc')
  })

  it('registers the supplied palette validator with Payload form state', () => {
    const validate = vi.fn(
      () => 'Primary and Text on primary need at least 4.5:1 contrast.',
    )
    render(
      <ColorPickerField
        field={field}
        path="theme.light.primary"
        validate={validate}
      />,
    )
    const options = useFieldOptions.mock.calls.at(-1)?.[0]
    expect(
      options.validate('#121212', { siblingData: { primaryInk: '#121212' } }),
    ).toContain('4.5:1 contrast')
    expect(validate).toHaveBeenCalledOnce()
  })

  it('honors disabled and read-only states', () => {
    fieldState.disabled = true
    const { rerender } = render(
      <ColorPickerField field={field} path="theme.light.primary" />,
    )
    expect(screen.getByLabelText<HTMLInputElement>('Primary').disabled).toBe(
      true,
    )

    fieldState.disabled = false
    rerender(
      <ColorPickerField field={field} path="theme.light.primary" readOnly />,
    )
    expect(screen.getByLabelText<HTMLInputElement>('Primary').disabled).toBe(
      true,
    )
  })

  it('keeps an invalid stored value visible without passing it to the color input', () => {
    fieldState.value = 'invalid'
    render(<ColorPickerField field={field} path="color" />)
    expect(screen.getByLabelText<HTMLInputElement>('Primary').value).toBe(
      '#000000',
    )
    expect(screen.getByText('invalid')).toBeDefined()
  })
})
