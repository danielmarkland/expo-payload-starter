import { createPublishingContentClient } from '@danielmarkland/publishing-core/contentClient'
import { draftMode } from 'next/headers'
import { internalApiRequest } from './internal'
import { getPreviewSecret } from '@/lib/serverConfig'
export const publishingClient = createPublishingContentClient(internalApiRequest, {
  enabled: async () => (await draftMode()).isEnabled,
  getSecret: getPreviewSecret,
})
