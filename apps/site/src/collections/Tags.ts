import { createTagsCollection } from '@danielmarkland/publishing-core/payloadCollections'
import { editorialAccess, slugScope } from '@/lib/publishingPolicy'

export const Tags = createTagsCollection({ access: editorialAccess, ...slugScope })
