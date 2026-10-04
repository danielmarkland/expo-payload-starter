import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from './index.js'

describe('createApiClient', () => {
  it('validates responses and forwards the access token', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      Response.json({
        avatarUrl: null,
        createdAt: '2026-09-30T12:00:00.000Z',
        displayName: 'Daniel',
        id: '1858bc0f-22e0-46f9-a2ce-94160f8fd0fa',
        updatedAt: '2026-09-30T12:00:00.000Z',
      }),
    )
    const client = createApiClient({
      baseUrl: 'https://example.test/api/v1',
      fetch,
      getAccessToken: async () => 'access-token',
    })

    await expect(client.getProfile()).resolves.toMatchObject({
      displayName: 'Daniel',
    })
    expect(fetch).toHaveBeenCalledWith(
      'https://example.test/api/v1/me/profile',
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    const headers = fetch.mock.calls[0]?.[1]?.headers as Headers
    expect(headers.get('authorization')).toBe('Bearer access-token')
  })
})
