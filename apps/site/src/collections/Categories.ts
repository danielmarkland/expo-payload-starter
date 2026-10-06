import { createCategoriesCollection } from '@danielmarkland/publishing-core/payloadCollections'
import { editorialAccess, slugScope } from '@/lib/publishingPolicy'

export const Categories = createCategoriesCollection({ access: editorialAccess, ...slugScope })
