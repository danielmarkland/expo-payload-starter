import type { ComponentProps, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { GoogleTagManager } from '@/components/GoogleTagManager'

vi.mock('next/script', () => ({
  default: ({ children, id }: ComponentProps<'script'> & { children?: ReactNode }) => (
    <script id={id}>{children}</script>
  ),
}))

describe('Google Tag Manager', () => {
  it('does not render when no container is configured', () => {
    const markup = renderToStaticMarkup(<GoogleTagManager containerId={null} />)

    expect(markup).not.toContain('google-tag-manager')
  })

  it('renders the configured container loader and noscript fallback', () => {
    const markup = renderToStaticMarkup(<GoogleTagManager containerId="GTM-ABC123" />)

    expect(markup).toContain("'GTM-ABC123'")
    expect(markup).toContain('https://www.googletagmanager.com/ns.html?id=GTM-ABC123')
  })

  it('rejects values that are not GTM container IDs', () => {
    expect(() => renderToStaticMarkup(<GoogleTagManager containerId="G-ABC123" />)).toThrow(
      'Google Tag Manager must use a valid GTM container ID (GTM-…).',
    )
  })
})
