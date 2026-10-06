import {
  createPublishingAccess,
  createPublishingGlobalAccess,
  publicRead,
  publishedOrEditor,
} from '@danielmarkland/publishing-core/payloadCollections'
export const editorialAccess = createPublishingAccess(publicRead)
export const draftAccess = createPublishingAccess(publishedOrEditor)
export const settingsAccess = createPublishingGlobalAccess(publicRead)
export const slugScope = {}
