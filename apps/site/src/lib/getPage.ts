import { draftMode } from 'next/headers'

import { pageSchema } from '@danielmarkland/contracts'
import { internalApiRequest } from '@/lib/api/internal'
import { getPreviewSecret } from '@/lib/serverConfig'
import type { Page } from '@/payload-types'

export async function getPage(slug: string) {
  const { isEnabled } = await draftMode()
  const response = await internalApiRequest(`/pages/${encodeURIComponent(slug)}`, {
    headers: isEnabled ? { 'x-preview-secret': getPreviewSecret() } : undefined,
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Page API request failed (${response.status}).`)
  return pageSchema.parse(await response.json()) as unknown as Page
}
