'use client'

import { useRowLabel } from '@payloadcms/ui'

type LinkRowData = {
  label?: string | null
}

export function LinkRowLabel() {
  const { data, rowNumber } = useRowLabel<LinkRowData>()
  const label = data?.label?.trim()
  const fallbackNumber = String((rowNumber ?? 0) + 1).padStart(2, '0')

  return <span className="row-label">{label || `Link ${fallbackNumber}`}</span>
}
