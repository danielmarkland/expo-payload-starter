'use client'
import type { ReactNode } from 'react'
import { Button } from './FunnelControls.js'
export type ProductWidgetProps = {
  title: string
  image?: { url: string; alt?: string | null } | null
  price?: string
  available: boolean
  busy?: boolean
  children?: ReactNode
  onOpen: () => void
  onAdd: () => void
}
/** Shared product presentation; hosts provide commerce and navigation operations. */
export function ProductWidget({
  title,
  image,
  price,
  available,
  busy,
  children,
  onOpen,
  onAdd,
}: ProductWidgetProps) {
  return (
    <article className="gp-product-widget">
      {image ? (
        <img src={image.url} alt={image.alt || title} loading="lazy" />
      ) : null}
      <h3>
        <Button onClick={onOpen}>{title}</Button>
      </h3>
      {price ? <p>{price}</p> : null}
      {children}
      <Button disabled={!available || busy} onClick={onAdd}>
        {busy ? 'Adding…' : available ? 'Add to cart' : 'Sold out'}
      </Button>
    </article>
  )
}
