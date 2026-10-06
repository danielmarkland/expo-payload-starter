import {
  LatestPostsSection as SharedLatestPostsSection,
  type LatestPostsOptions,
} from '@danielmarkland/publishing-ui/LatestPostsSection'
import type { ReactNode } from 'react'
import { latestPostsQuery } from '@danielmarkland/publishing-core/postSelection'
import { getPublishedPosts } from '@/lib/api/content'
export async function LatestPostsSection(
  props: LatestPostsOptions & { actionElement?: ReactNode },
) {
  const query = latestPostsQuery(props)
  if (!query) return null
  const { docs } = await getPublishedPosts(query)
  return <SharedLatestPostsSection {...props} posts={docs} />
}
