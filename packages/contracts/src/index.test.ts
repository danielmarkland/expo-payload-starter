import { describe, expect, it } from 'vitest'

import {
  contactSubmissionSchema,
  profileSchema,
  welcomeEmailRequestSchema,
} from './index.js'

describe('profileSchema', () => {
  it('accepts the public profile contract', () => {
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

describe('welcomeEmailRequestSchema', () => {
  it('accepts an idempotency key without accepting a client recipient', () => {
    const parsed = welcomeEmailRequestSchema.parse({
      idempotencyKey: 'ad2eff36-2515-4afa-9618-0f16bcbb63dc',
    })
    expect(parsed).toEqual({
      idempotencyKey: 'ad2eff36-2515-4afa-9618-0f16bcbb63dc',
    })
  })

  it('rejects malformed keys', () => {
    expect(() =>
      welcomeEmailRequestSchema.parse({ idempotencyKey: 'not-a-uuid' }),
    ).toThrow()
  })
})

describe('contactSubmissionSchema', () => {
  it('accepts valid public contact submissions', () => {
    expect(
      contactSubmissionSchema.parse({
        email: 'daniel@example.com',
        message: 'I would like to discuss a project.',
        name: 'Daniel Markland',
        turnstileToken: 'verified-token',
      }),
    ).toMatchObject({ website: '' })
  })

  it('rejects malformed contact submissions', () => {
    expect(() =>
      contactSubmissionSchema.parse({
        email: 'not-an-email',
        message: 'Too short',
        name: 'D',
        turnstileToken: '',
      }),
    ).toThrow()
  })
})
