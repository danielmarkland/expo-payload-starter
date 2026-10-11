'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Keeps navigation server-rendered while tracking the header's surface and height. */
export function HeaderSurface({
  children,
  variant,
  sticky,
  topBackground,
  scrolledBackground,
}: {
  children: ReactNode
  variant?: 'standard' | 'minimal' | null
  sticky?: boolean | null
  topBackground?: 'fill' | 'transparent' | null
  scrolledBackground?: 'fill' | 'transparent' | null
}) {
  const ref = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('pageshow', update)
    const header = ref.current
    const parent = header?.parentElement
    const previousHeight = parent?.style.getPropertyValue(
      '--publishing-header-height',
    )
    const measure = () => {
      if (header && parent)
        parent.style.setProperty(
          '--publishing-header-height',
          `${header.getBoundingClientRect().height}px`,
        )
    }
    measure()
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    if (header) observer?.observe(header)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('pageshow', update)
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      if (parent) {
        if (previousHeight)
          parent.style.setProperty('--publishing-header-height', previousHeight)
        else parent.style.removeProperty('--publishing-header-height')
      }
    }
  }, [])

  return (
    <header
      ref={ref}
      data-header-default={variant || 'standard'}
      data-header-top-background={topBackground || 'fill'}
      data-header-background={
        (scrolled ? scrolledBackground : topBackground) || 'fill'
      }
      data-header-state={scrolled ? 'scrolled' : 'top'}
      className={`site-header${sticky ? ' site-header-sticky' : ''}`}
    >
      {children}
    </header>
  )
}
