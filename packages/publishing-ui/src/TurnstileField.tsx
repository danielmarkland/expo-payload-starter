'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      remove: (widgetId: string) => void
      render: (
        container: HTMLElement,
        options: Record<string, unknown>,
      ) => string
    }
  }
}

export function TurnstileField({
  action,
  siteKey,
}: {
  action: string
  siteKey: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<null | string>(null)
  const widgetSize = useRef<string | null>(null)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return
    const size = containerRef.current.clientWidth < 300 ? 'compact' : 'normal'
    if (widgetId.current && widgetSize.current === size) return
    if (widgetId.current) window.turnstile.remove(widgetId.current)
    widgetSize.current = size
    widgetId.current = window.turnstile.render(containerRef.current, {
      action,
      sitekey: siteKey,
      size,
    })
  }, [action, siteKey])

  useEffect(() => {
    renderWidget()
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(renderWidget)
    if (containerRef.current) observer?.observe(containerRef.current)
    return () => {
      observer?.disconnect()
      if (widgetId.current && window.turnstile)
        window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
  }, [renderWidget])

  return (
    <>
      <Script
        onReady={renderWidget}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} />
    </>
  )
}
