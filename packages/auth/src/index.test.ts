import { describe, expect, it } from 'vitest'

import { ownsResource } from './index.js'

describe('ownsResource', () => {
  it('requires the authenticated user to match the owner', () => {
    expect(ownsResource({ email: null, id: 'user-1' }, 'user-1')).toBe(true)
    expect(ownsResource({ email: null, id: 'user-1' }, 'user-2')).toBe(false)
    expect(ownsResource(null, 'user-1')).toBe(false)
  })
})
