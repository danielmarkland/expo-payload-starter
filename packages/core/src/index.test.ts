import { describe, expect, it } from 'vitest'

import { profileLabel } from './index.js'

describe('profileLabel', () => {
  const user = { email: 'developer@example.com', id: crypto.randomUUID() }

  it('prefers a non-empty profile display name', () => {
    expect(profileLabel({ displayName: ' Ada ' }, user)).toBe('Ada')
  })

  it('falls back to email and then a neutral label', () => {
    expect(profileLabel({ displayName: ' ' }, user)).toBe(user.email)
    expect(profileLabel(null, { ...user, email: null })).toBe('Member')
  })
})
