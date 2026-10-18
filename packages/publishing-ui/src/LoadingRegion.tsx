import type { CSSProperties, ReactNode } from 'react'

/** A visual loading region; callers own the geometry and lifetime of its content. */
export function LoadingRegion({
  loading,
  label = 'Loading content',
  children,
  className,
}: {
  loading: boolean
  label?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className} aria-busy={loading}>
      <span
        className="publishing-loading-status"
        role="status"
        aria-live="polite"
      >
        {loading ? label : ''}
      </span>
      {children}
    </div>
  )
}

/** Decorative static placeholder, composed into a screen by its owner. */
export function Skeleton({
  width,
  height = '1em',
  className,
}: {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={['publishing-skeleton', className].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  )
}
