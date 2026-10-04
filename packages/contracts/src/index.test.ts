import { describe, expect, it } from 'vitest'

import { profileSchema } from './index.js'

describe('profileSchema', () => {
  it('accepts the example product profile contract', () => {
    expect(
      profileSchema.parse({
        avatarUrl: null,
        createdAt: '2026-09-25T12:00:00.000Z',
        displayName: 'Ada',
        id: crypto.randomUUID(),
        updatedAt: '2026-09-25T12:00:00.000Z',
      }).displayName,
    ).toBe('Ada')
  })
})
