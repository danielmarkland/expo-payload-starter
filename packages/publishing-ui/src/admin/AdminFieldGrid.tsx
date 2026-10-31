'use client'
import type { ReactNode } from 'react'

/** Host workflow fields share the same available-width policy as native rows. */
export function AdminFieldGrid({ children }: { children: ReactNode }) {
  return (
    <div className="admin-field-grid">
      <div className="admin-field-grid__fields">{children}</div>
    </div>
  )
}
