import { createPostsCollection } from '@danielmarkland/publishing-core/payloadCollections'
import { draftAccess, slugScope } from '@/lib/publishingPolicy'
import { createCMSPreview } from '@/lib/cmsPreview'

export const Posts = createPostsCollection({
  access: draftAccess,
  ...slugScope,
  preview: createCMSPreview('posts'),
})
