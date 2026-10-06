import { createMediaCollection } from '@danielmarkland/publishing-core/payloadCollections'
import { editorialAccess } from '@/lib/publishingPolicy'

export const Media = createMediaCollection({ access: editorialAccess })
