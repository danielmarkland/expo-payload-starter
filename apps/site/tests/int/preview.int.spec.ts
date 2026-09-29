import { afterEach, describe, expect, it, vi } from 'vitest'

const { enableDraftMode } = vi.hoisted(() => ({ enableDraftMode: vi.fn() }))

vi.mock('next/headers', () => ({
  draftMode: async () => ({ enable: enableDraftMode }),
}))

vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`)
  },
}))

import { GET } from '@/app/(frontend)/api/preview/route'
import { getPreviewSecret } from '@/lib/serverConfig'

describe('CMS preview route', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    enableDraftMode.mockClear()
  })

  it('redirects a home page preview to the homepage and enables draft mode', async () => {
    vi.stubEnv('PAYLOAD_SECRET', 'payload-test-secret')
    const secret = getPreviewSecret()
    const request = new Request(
      `http://localhost/api/preview?collection=pages&slug=home&secret=${secret}`,
    )

    await expect(GET(request)).rejects.toThrow('redirect:/')
    expect(enableDraftMode).toHaveBeenCalledOnce()
  })

  it('keeps post preview URLs working and rejects unsupported collections', async () => {
    vi.stubEnv('PAYLOAD_SECRET', 'payload-test-secret')
    const secret = getPreviewSecret()
    const postRequest = new Request(`http://localhost/api/preview?slug=first-post&secret=${secret}`)
    await expect(GET(postRequest)).rejects.toThrow('redirect:/posts/first-post')

    const invalidRequest = new Request(
      `http://localhost/api/preview?collection=users&slug=admin&secret=${secret}`,
    )
    const response = await GET(invalidRequest)
    expect(response.status).toBe(401)
  })
})
