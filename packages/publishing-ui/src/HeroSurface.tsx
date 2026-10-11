'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { measureHeroSpacing } from './heroViewportSpacing.js'

/** Account for authored gutters and transparent-header overlap without fixed heights. */
export function HeroSurface({
  children,
  className,
  viewport,
}: {
  children: ReactNode
  className: string
  viewport: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!viewport || !ref.current) return
    const hero = ref.current
    const block = hero.parentElement
    const main = block?.parentElement
    if (!block || !main) return
    const header =
      main.parentElement?.querySelector<HTMLElement>('.site-header')
    const measure = () => measureHeroSpacing(hero)
    measure()
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    for (const element of [block, main, header])
      if (element) observer?.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      hero.style.removeProperty('--publishing-hero-spacing')
    }
  }, [viewport])
  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  )
}
