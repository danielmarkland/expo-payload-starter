import { selectedPostIDsSchema } from '@danielmarkland/publishing-contracts'
export { selectedPostIDsSchema } from '@danielmarkland/publishing-contracts'
import type { ApiPageBlock } from '@danielmarkland/publishing-contracts'

export function orderSelectedPosts<T extends { id: number | string }>(
  posts: readonly T[],
  ids: readonly (number | string)[],
): T[] {
  const byID = new Map(posts.map((post) => [String(post.id), post]))
  return [...new Set(ids.map(String))].flatMap((id) => {
    const post = byID.get(id)
    return post ? [post] : []
  })
}
export function latestPostsQuery(
  block: Pick<
    Extract<ApiPageBlock, { blockType: 'latestPosts' }>,
    'source' | 'limit' | 'category' | 'selectedPosts'
  >,
): string | null {
  const query = new URLSearchParams({ limit: String(block.limit || 3) })
  if (block.source === 'category') {
    const category =
      typeof block.category === 'object' ? block.category?.id : block.category
    if (!category) return null
    query.set('categoryId', String(category))
  }
  if (block.source === 'selected') {
    const ids =
      block.selectedPosts?.map((post) =>
        typeof post === 'object' ? post.id : post,
      ) || []
    if (!ids.length) return null
    const result = selectedPostIDsSchema.safeParse(ids.join(','))
    if (!result.success) return null
    query.set('ids', result.data.join(','))
    query.set('limit', String(result.data.length))
  }
  return '?' + query.toString()
}
export function archivePageNumber(
  value: string | string[] | undefined,
): number | null {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const page = Number(value)
  return Number.isSafeInteger(page) ? page : null
}
