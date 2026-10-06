// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { apiErrorSchema } from '@danielmarkland/publishing-contracts'
vi.mock('@/payload.config', () => ({ default: {} }))
import { apiApp } from '@/lib/api/app'
describe('registered publishing protocol', () => {
  it('returns a portable noncacheable error for invalid selected-post IDs', async () => {
    const response = await apiApp.request('https://site.example/api/v1/posts?ids=invalid')
    expect(response.status).toBe(400)
    expect(apiErrorSchema.parse(await response.json()).error.code).toBe('validation_error')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })
  it('documents selected IDs and every service error status', async () => {
    const response = await apiApp.request('https://site.example/api/v1/openapi.json')
    const document = await response.json()
    const posts = document.paths['/api/v1/posts'].get
    expect(posts.parameters.map((param: { name: string }) => param.name)).toContain('ids')
    expect(posts.responses).toHaveProperty('409')
    expect(posts.responses).toHaveProperty('502')
  })
})
