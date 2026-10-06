import { describe, expect, it } from 'vitest'
import {
  archivePresentationSchema,
  contactSubmissionSchema,
  pageBlockSchema,
} from './index.js'
describe('layout compatibility', () => {
  it('keeps existing latest-post blocks valid and provides archive defaults', () => {
    expect(
      pageBlockSchema.parse({ blockType: 'latestPosts', limit: 3 }).limit,
    ).toBe(3)
    expect(archivePresentationSchema.parse({}).pageSize).toBe(12)
    expect(archivePresentationSchema.parse({}).imageProportion).toBe(
      'landscape',
    )
  })
  it('supports curated artwork and plain numbered features', () => {
    expect(
      pageBlockSchema.safeParse({
        blockType: 'latestPosts',
        source: 'selected',
        selectedPosts: [1, 2],
        presentation: 'imageOnly',
        imageProportion: 'square',
      }).success,
    ).toBe(true)
    expect(
      pageBlockSchema.safeParse({
        blockType: 'featureGrid',
        heading: 'Steps',
        layout: 'plain',
        numbered: true,
        items: [
          { title: 'Research', description: 'Details', ruleColor: '#00ff00' },
        ],
      }).success,
    ).toBe(true)
  })
  it('accepts both contact name modes and validates booking fields', () => {
    const base = {
      email: 'test@example.com',
      message: 'A long enough message',
      turnstileToken: 'token',
    }
    expect(
      contactSubmissionSchema.parse({ ...base, name: 'Daniel' }).name,
    ).toBe('Daniel')
    expect(
      contactSubmissionSchema.parse({
        ...base,
        firstName: 'Daniel',
        lastName: 'Markland',
        company: 'Company',
      }).company,
    ).toBe('Company')
    for (const extra of [
      {},
      { firstName: 'Daniel' },
      { firstName: '', lastName: 'Markland' },
      { name: 'Daniel', company: 'x'.repeat(201) },
    ])
      expect(
        contactSubmissionSchema.safeParse({ ...base, ...extra }).success,
      ).toBe(false)
  })
})
