import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { useRowLabel } = vi.hoisted(() => ({ useRowLabel: vi.fn() }))

vi.mock('@payloadcms/ui', () => ({ useRowLabel }))

import { LinkRowLabel } from '@/components/admin/LinkRowLabel'

describe('LinkRowLabel', () => {
  beforeEach(() => useRowLabel.mockReset())

  it('uses the configured link label', () => {
    useRowLabel.mockReturnValue({ data: { label: 'Contact' }, rowNumber: 0 })

    expect(renderToStaticMarkup(<LinkRowLabel />)).toContain('Contact')
  })

  it('uses a numbered link fallback for an empty label', () => {
    useRowLabel.mockReturnValue({ data: { label: '  ' }, rowNumber: 1 })

    expect(renderToStaticMarkup(<LinkRowLabel />)).toContain('Link 02')
  })
})
