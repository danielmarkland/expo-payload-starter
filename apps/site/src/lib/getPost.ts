import { draftMode } from 'next/headers'

import { postSchema } from '@danielmarkland/publishing-contracts'
import { internalApiRequest } from '@/lib/api/internal'
import { getPreviewSecret } from '@/lib/serverConfig'

export async function getPost(slug: string) {
  const { isEnabled } = await draftMode()
  const response = await internalApiRequest(`/posts/${encodeURIComponent(slug)}`, {
    headers: isEnabled ? { 'x-preview-secret': getPreviewSecret() } : undefined,
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Post API request failed (${response.status}).`)
  return postSchema.parse(await response.json())
}
