'use client'
import { useConfig, useTranslation } from '@payloadcms/ui'
import { formatDate } from '@payloadcms/ui/shared'

/** Use the same locale, date format and timezone handling as native list cells. */
export function AdminDate({
  value,
  timezone,
}: {
  value?: Date | number | string | null
  timezone?: string
}) {
  const { config } = useConfig()
  const { i18n } = useTranslation()
  if (!value) return <span>—</span>
  return (
    <time dateTime={new Date(value).toISOString()}>
      {formatDate({
        date: value,
        i18n,
        pattern: config.admin.dateFormat,
        timezone,
      })}
    </time>
  )
}
