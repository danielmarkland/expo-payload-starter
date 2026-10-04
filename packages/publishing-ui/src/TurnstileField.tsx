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

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetId.current) return
    widgetId.current = window.turnstile.render(containerRef.current, {
      action,
      sitekey: siteKey,
    })
  }, [action, siteKey])

  useEffect(() => {
    renderWidget()
    return () => {
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
