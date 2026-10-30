import { expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { publishingOverview } from './adminOverview.js'

it('runs every summary query through native access with the original scoped request', async () => {
  const find = vi.fn(async (_input: unknown) => ({
    totalDocs: 2,
    docs: [
      {
        id: 1,
        title: 'A',
        _status: 'draft',
        updatedAt: '2026-10-29T00:00:00Z',
      },
    ],
  }))
  const req = {
    payload: { collections: { posts: {}, pages: {} }, find },
    headers: new Headers({ cookie: 'payload-tenant=7' }),
  } as unknown as PayloadRequest
  const summary = await publishingOverview(req)
  expect(find).toHaveBeenCalledTimes(4)
  for (const call of find.mock.calls)
    expect(call[0]).toMatchObject({
      req,
      overrideAccess: false,
      draft: true,
      depth: 0,
    })
  expect(summary.drafts.map((item) => item.count)).toEqual([2, 2])
  for (const item of summary.drafts) {
    const destination = new URL(item.href, 'https://admin.example.test')
    expect(destination.searchParams.get('where[_status][equals]')).toBe('draft')
  }
})
