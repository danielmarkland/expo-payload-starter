import { Children, type ReactNode } from 'react'

export function PageActions({ children }: { children?: ReactNode }) {
  if (!Children.toArray(children).length) return null
  return (
    <div className="page-actions" role="group" aria-label="Page Actions">
      {children}
    </div>
  )
}
