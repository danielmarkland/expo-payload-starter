'use client'

import type { TextFieldClientComponent, Validate } from 'payload'
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import { useCallback, useId } from 'react'

import './ColorPickerField.css'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const FALLBACK_COLOR = '#000000'

export const ColorPickerField: TextFieldClientComponent = ({
  field,
  path,
  readOnly,
  validate,
}) => {
  const inputId = `color-picker-${useId().replaceAll(':', '')}`
  const validateColor = useCallback<Validate>(
    (value, options) =>
      validate?.(value, {
        ...options,
        type: 'text',
        name: field.name,
        required: field.required,
        minLength: field.minLength,
        maxLength: field.maxLength,
      }) ?? true,
    [validate, field.name, field.required, field.minLength, field.maxLength],
  )
  const { disabled, setValue, showError, value } = useField<string>({
    path,
    validate: validate ? validateColor : undefined,
  })
  const currentValue = typeof value === 'string' ? value : ''
  const pickerValue = HEX_COLOR.test(currentValue)
    ? currentValue
    : FALLBACK_COLOR
  const isDisabled = Boolean(readOnly || disabled)

  return (
    <div
      className={[
        'field-type',
        'color-picker-field',
        field.admin?.className,
        showError && 'error',
      ]
        .filter(Boolean)
        .join(' ')}
      style={mergeFieldStyles(field)}
    >
      <FieldLabel
        htmlFor={inputId}
        label={field.label}
        localized={field.localized}
        path={path}
        required={field.required}
      />
      <div className="color-picker-field__control">
        <input
          aria-invalid={showError || undefined}
          className="color-picker-field__input"
          disabled={isDisabled}
          id={inputId}
          name={path}
          onChange={(event) => setValue(event.target.value.toLowerCase())}
          type="color"
          value={pickerValue}
        />
        <output className="color-picker-field__value" htmlFor={inputId}>
          {currentValue || pickerValue}
        </output>
        <FieldError path={path} showError={showError} />
      </div>
      <FieldDescription
        description={field.admin?.description}
        marginPlacement="bottom"
        path={path}
      />
    </div>
  )
}
