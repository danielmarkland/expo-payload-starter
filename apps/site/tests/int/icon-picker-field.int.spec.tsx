import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { SelectFieldClientProps } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

const fieldState = vi.hoisted(() => ({
  disabled: false,
  setValue: vi.fn(),
  showError: false,
  value: 'instagram',
}))

type MockSelectComponentProps = {
  children?: React.ReactNode
  data: { label: string; value: string }
}

vi.mock('@payloadcms/ui', () => ({
  FieldDescription: ({ description }: { description?: string }) => <div>{description}</div>,
  FieldError: () => null,
  FieldLabel: ({ label }: { label?: string }) => <label>{label}</label>,
  ReactSelect: ({
    components,
    onChange,
    options,
    value,
  }: {
    components: Record<string, React.ComponentType<MockSelectComponentProps>>
    onChange: (option: { label: string; value: string }) => void
    options: Array<{ label: string; value: string }>
    value?: { label: string; value: string }
  }) => {
    const Option = components.Option
    const SingleValue = components.SingleValue
    const facebook = options.find((option) => option.value === 'facebook')

    return (
      <div>
        {value ? <SingleValue data={value}>{value.label}</SingleValue> : null}
        {facebook ? <Option data={facebook}>{facebook.label}</Option> : null}
        <button onClick={() => onChange({ label: 'YouTube', value: 'youtube' })}>Choose</button>
      </div>
    )
  },
  useField: () => fieldState,
}))

vi.mock('@payloadcms/ui/shared', () => ({
  mergeFieldStyles: (field: SelectFieldClientProps['field']) => ({
    '--field-width': field.admin?.width,
  }),
}))

import { IconPickerField } from '@/components/admin/IconPickerField'
import { linkIconOptions } from '@/lib/linkIcons'

const field = {
  admin: { description: 'Choose an icon.', width: '25%' },
  label: 'Icon',
  name: 'icon',
  options: linkIconOptions,
  type: 'select',
} as SelectFieldClientProps['field']

describe('Payload icon picker field', () => {
  afterEach(() => {
    cleanup()
    fieldState.disabled = false
    fieldState.setValue.mockReset()
    fieldState.showError = false
    fieldState.value = 'instagram'
  })

  it('renders icons beside list options and the selected value', () => {
    const { container } = render(<IconPickerField field={field} path="icon" />)

    expect(screen.getByText('Instagram').parentElement?.querySelector('svg')).not.toBeNull()
    expect(screen.getByText('Facebook').parentElement?.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('.icon-picker-field')?.getAttribute('style')).toContain(
      '--field-width: 25%',
    )

    fireEvent.click(screen.getByText('Choose'))
    expect(fieldState.setValue).toHaveBeenCalledWith('youtube')
  })

  it('offers unique brand and general icon values', () => {
    const values = linkIconOptions.map(({ value }) => value)

    expect(new Set(values).size).toBe(values.length)
    expect(values).toEqual(
      expect.arrayContaining([
        'bluesky',
        'facebook',
        'github',
        'instagram',
        'linkedin',
        'tiktok',
        'twitter',
        'youtube',
        'calendar',
        'download',
        'globe',
        'mail',
        'shopping-cart',
      ]),
    )
    expect(values.length).toBeGreaterThanOrEqual(60)
  })
})
