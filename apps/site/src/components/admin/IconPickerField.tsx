'use client'

import type { SelectFieldClientComponent } from 'payload'
import { FieldDescription, FieldError, FieldLabel, ReactSelect, useField } from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import { createElement } from 'react'

import { getLinkIcon, linkIconDefinitions } from '@/lib/linkIcons'

import './IconPickerField.css'

type PickerOption = {
  label: string
  value: string
}

type PickerOptionProps = {
  children: React.ReactNode
  data: PickerOption
  innerProps: React.HTMLAttributes<HTMLDivElement>
  innerRef?: React.Ref<HTMLDivElement>
  isFocused?: boolean
  isSelected?: boolean
}

function IconOption({
  children,
  data,
  innerProps,
  innerRef,
  isFocused,
  isSelected,
}: PickerOptionProps) {
  const Icon = getLinkIcon(data.value)

  return (
    <div
      {...innerProps}
      className="icon-picker-field__option"
      data-focused={isFocused || undefined}
      data-selected={isSelected || undefined}
      ref={innerRef}
    >
      <span>{children}</span>
      {Icon ? createElement(Icon, { 'aria-hidden': true }) : null}
    </div>
  )
}

function IconSingleValue({ children, data }: Pick<PickerOptionProps, 'children' | 'data'>) {
  const Icon = getLinkIcon(data.value)

  return (
    <div className="icon-picker-field__value">
      <span>{children}</span>
      {Icon ? createElement(Icon, { 'aria-hidden': true }) : null}
    </div>
  )
}

export const IconPickerField: SelectFieldClientComponent = ({ field, path, readOnly }) => {
  const { disabled, setValue, showError, value } = useField<string>({ path })
  const availableValues = new Set(
    field.options.map((option) => (typeof option === 'string' ? option : String(option.value))),
  )
  const options = linkIconDefinitions
    .filter(({ value: optionValue }) => availableValues.has(optionValue))
    .map(({ label, value: optionValue }) => ({ label, value: optionValue }))
  const selected = options.find((option) => option.value === value)

  return (
    <div
      className={['field-type', 'select', 'icon-picker-field', field.admin?.className]
        .filter(Boolean)
        .join(' ')}
      id={`field-${path.replaceAll('.', '__')}`}
      style={mergeFieldStyles(field)}
    >
      <FieldLabel
        label={field.label}
        localized={field.localized}
        path={path}
        required={field.required}
      />
      <div className="icon-picker-field__control">
        <FieldError path={path} showError={showError} />
        <ReactSelect
          className="icon-picker-field__select"
          components={{ Option: IconOption, SingleValue: IconSingleValue }}
          disabled={Boolean(readOnly || disabled)}
          isClearable={!field.required}
          isSearchable
          onChange={(option) => setValue(Array.isArray(option) ? null : option?.value || null)}
          options={options}
          placeholder="Select an icon"
          showError={showError}
          value={selected}
        />
      </div>
      <FieldDescription
        description={field.admin?.description}
        marginPlacement="bottom"
        path={path}
      />
    </div>
  )
}
