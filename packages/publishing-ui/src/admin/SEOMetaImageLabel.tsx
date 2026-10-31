'use client'
import { FieldLabel } from '@payloadcms/ui'
import type { FieldLabelClientProps, UploadFieldClient } from 'payload'

/** Add guidance while retaining Payload's localized label and required marker. */
export function SEOMetaImageLabel({
  field,
  label,
  localized,
  required,
  ...props
}: FieldLabelClientProps<UploadFieldClient>) {
  return (
    <div className="seo-image-label">
      <FieldLabel
        {...props}
        label={label ?? field?.label ?? 'Meta Image'}
        localized={localized ?? field?.localized}
        required={required ?? field?.required}
      />
      <p className="seo-field-description">
        Used when this page is shared. Recommended image size: 1200 × 630
        pixels.
      </p>
    </div>
  )
}
