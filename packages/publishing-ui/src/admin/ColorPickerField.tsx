'use client'

import type { TextFieldClientProps, Validate } from 'payload'
import {
  isPaletteColorName,
  validatePaletteColor,
} from '@danielmarkland/publishing-core/colorContrast'
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

export const ColorPickerField = ({
  field,
  path,
  readOnly,
  validate,
  paletteColor,
}: TextFieldClientProps & { paletteColor?: unknown }) => {
  const inputId = `color-picker-${useId().replaceAll(':', '')}`
  const validateColor = useCallback<Validate>(
    async (value, options) => {
      const fieldOptions = {
        ...options,
        type: 'text' as const,
        name: field.name,
        required: field.required,
        minLength: field.minLength,
        maxLength: field.maxLength,
      }
      // Payload can supply only its generic text validator on the client.
      // Reuse the portable palette rule so it cannot clear server contrast errors.
      if (isPaletteColorName(paletteColor)) {
        const contrast = await validatePaletteColor(paletteColor)(
          value,
          fieldOptions,
        )
        if (contrast !== true) return contrast
      }
      return validate?.(value, fieldOptions) ?? true
    },
    [
      validate,
      paletteColor,
      field.name,
      field.required,
      field.minLength,
      field.maxLength,
    ],
  )
  const { disabled, setValue, showError, value } = useField<string>({
    path,
    validate:
      validate || isPaletteColorName(paletteColor) ? validateColor : undefined,
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
