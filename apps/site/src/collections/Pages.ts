import { createPagesCollection } from '@danielmarkland/publishing-core/payloadCollections'
import { draftAccess, slugScope } from '@/lib/publishingPolicy'
import { createCMSPreview } from '@/lib/cmsPreview'
import { pageBlocks } from '@/blocks'

export const Pages = createPagesCollection({
  access: draftAccess,
  ...slugScope,
  preview: createCMSPreview('pages'),
  pageBlocks,
})
