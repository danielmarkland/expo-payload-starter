import { createAuthorsCollection } from '@danielmarkland/publishing-core/payloadCollections'
import { editorialAccess, slugScope } from '@/lib/publishingPolicy'

export const Authors = createAuthorsCollection({ access: editorialAccess, ...slugScope })
