import type { ComponentProps, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GoogleTagManager } from '@/components/GoogleTagManager'

vi.mock('next/script', () => ({
  default: ({ children, id }: ComponentProps<'script'> & { children?: ReactNode }) => (
    <script id={id}>{children}</script>
  ),
}))

describe('Google Tag Manager', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not render when no container is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_CONTAINER_ID', '')

    const markup = renderToStaticMarkup(<GoogleTagManager />)

    expect(markup).not.toContain('google-tag-manager')
  })

  it('renders the configured container loader and noscript fallback', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_CONTAINER_ID', 'GTM-ABC123')

    const markup = renderToStaticMarkup(<GoogleTagManager />)

    expect(markup).toContain("'GTM-ABC123'")
    expect(markup).toContain('https://www.googletagmanager.com/ns.html?id=GTM-ABC123')
  })

  it('rejects values that are not GTM container IDs', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_CONTAINER_ID', 'G-ABC123')

    expect(() => renderToStaticMarkup(<GoogleTagManager />)).toThrow(
      'NEXT_PUBLIC_GTM_CONTAINER_ID must be a valid GTM container ID (GTM-…).',
    )
  })
})
