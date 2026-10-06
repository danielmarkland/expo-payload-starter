import { createLegacyPublishingForwarder } from '@danielmarkland/publishing-core/contentClient'
import { apiApp } from '@/lib/api/app'

export function internalApiRequest(path: string, init?: RequestInit) {
  return apiApp.request(`http://internal/api/v1${path}`, init)
}

export const forwardToV1 = createLegacyPublishingForwarder(internalApiRequest)
