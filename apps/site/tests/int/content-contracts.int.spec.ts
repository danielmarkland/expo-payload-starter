import { afterEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ request: vi.fn(), enabled: false }))
vi.mock('@/lib/api/internal', () => ({ internalApiRequest: mocks.request }))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: mocks.enabled }) }))
import { getPage } from '@/lib/getPage'
import { getPost } from '@/lib/getPost'
import {
  getNavigationDocuments,
  getTaxonomyDocument,
  getRedirectDocuments,
} from '@/lib/api/content'
import { getPreviewSecret } from '@/lib/serverConfig'
const body = {
  root: { type: 'root', version: 1, children: [], direction: null, format: '', indent: 0 },
}
afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  mocks.enabled = false
})
describe('validated content consumers', () => {
  it.each([getPage, getPost])(
    'handles missing, failed, and malformed responses',
    async (consumer) => {
      mocks.request.mockResolvedValueOnce(new Response(null, { status: 404 }))
      expect(await consumer('missing')).toBeNull()
      mocks.request.mockResolvedValueOnce(new Response(null, { status: 503 }))
      await expect(consumer('failed')).rejects.toThrow('503')
      mocks.request.mockResolvedValueOnce(
        Response.json({
          id: 1,
          slug: 'bad',
          title: 'Bad',
          layout: [{ blockType: 'hero', heading: {} }],
          body: {},
        }),
      )
      await expect(consumer('bad')).rejects.toThrow()
    },
  )
  it.each([false, true])(
    'preserves draft preview header and returned status (%s)',
    async (enabled) => {
      mocks.enabled = enabled
      vi.stubEnv('PAYLOAD_SECRET', 'contract-test-secret')
      const status = enabled ? 'draft' : 'published'
      mocks.request.mockResolvedValueOnce(
        Response.json({ id: 1, slug: 'example', title: 'Example', layout: [], _status: status }),
      )
      expect((await getPage('example'))?._status).toBe(status)
      mocks.request.mockResolvedValueOnce(
        Response.json({
          id: 1,
          slug: 'example',
          title: 'Example',
          summary: '',
          body,
          _status: status,
        }),
      )
      expect((await getPost('example'))?._status).toBe(status)
      expect(mocks.request).toHaveBeenNthCalledWith(1, '/pages/example', {
        headers: enabled ? { 'x-preview-secret': getPreviewSecret() } : undefined,
      })
      expect(mocks.request).toHaveBeenNthCalledWith(2, '/posts/example', {
        headers: enabled ? { 'x-preview-secret': getPreviewSecret() } : undefined,
      })
    },
  )
  it('rejects malformed navigation, authors, taxonomy and redirects at the boundary', async () => {
    for (const read of [
      getNavigationDocuments,
      () => getTaxonomyDocument('authors', 'ada'),
      () => getTaxonomyDocument('categories', 'news'),
      getRedirectDocuments,
    ]) {
      mocks.request.mockResolvedValueOnce(
        Response.json({
          header: { showSearch: true, items: [{ label: 1 }] },
          footer: {},
          redirects: [{ from: '/old', type: 'bad' }],
          id: 1,
          slug: 'bad',
          name: 1,
          title: 1,
        }),
      )
      await expect(read()).rejects.toThrow()
    }
  })
})
