import { LatestPostsSection as SharedLatestPostsSection } from '@danielmarkland/publishing-ui/LatestPostsSection'
import { getPublishedPosts } from '@/lib/api/content'

export async function LatestPostsSection({
  eyebrow,
  heading,
  limit,
}: {
  eyebrow?: string | null
  heading?: string | null
  limit?: number | null
}) {
  const { docs } = await getPublishedPosts(`?limit=${limit || 3}`)
  return <SharedLatestPostsSection eyebrow={eyebrow} heading={heading} posts={docs} />
}
