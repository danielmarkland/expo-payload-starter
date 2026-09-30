import { describe, expect, it, vi } from 'vitest'

vi.mock('@/payload.config', () => ({ default: {} }))

import { apiApp } from '@/lib/api/app'

describe('OpenAPI document', () => {
  it('documents the canonical site, content, form, and product routes', async () => {
    const response = await apiApp.request('http://localhost/api/v1/openapi.json')
    expect(response.status).toBe(200)
    const document = (await response.json()) as {
      components?: { securitySchemes?: Record<string, unknown> }
      paths?: Record<string, unknown>
    }

    expect(Object.keys(document.paths ?? {})).toEqual(
      expect.arrayContaining([
        '/api/v1/contact',
        '/api/v1/me/profile',
        '/api/v1/navigation',
        '/api/v1/newsletter',
        '/api/v1/pages/{slug}',
        '/api/v1/posts',
        '/api/v1/posts/{slug}',
        '/api/v1/search',
        '/api/v1/site-config',
      ]),
    )
    expect(document.components?.securitySchemes).toHaveProperty('bearerAuth')
  })
})
