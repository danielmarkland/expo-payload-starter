import { createPreviewURLBuilder } from '@danielmarkland/publishing-core/preview'
import { getPreviewSecret, getSiteURL } from '@/lib/serverConfig'
export const createCMSPreview = createPreviewURLBuilder({
  getSecret: getPreviewSecret,
  getSiteURL: () => getSiteURL(),
})
