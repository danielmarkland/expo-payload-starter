import type { FooterContentArea } from '@danielmarkland/publishing-contracts'

export function moveFooterBlock(
  areas: FooterContentArea[],
  blockId: string,
  columnId: string,
  beforeBlockId?: string,
): FooterContentArea[] {
  const next = structuredClone(areas)
  const columns = next.flatMap((area) => area.columns)
  const source = columns.find((column) =>
    column.blocks?.some((block) => block.id === blockId),
  )
  const destination = columns.find((column) => column.id === columnId)
  if (!source || !destination || blockId === beforeBlockId) return areas
  const index = source.blocks!.findIndex((block) => block.id === blockId)
  const [block] = source.blocks!.splice(index, 1)
  if (!block) return areas
  destination.blocks ??= []
  const before = beforeBlockId
    ? destination.blocks.findIndex((item) => item.id === beforeBlockId)
    : -1
  destination.blocks.splice(
    before < 0 ? destination.blocks.length : before,
    0,
    block,
  )
  return next
}

export function footerLatestPostsLimit(
  areas: FooterContentArea[] | null | undefined,
): number {
  return Math.max(
    0,
    ...(areas ?? []).flatMap((area) =>
      area.columns.flatMap(
        (column) =>
          column.blocks?.flatMap((block) =>
            block.blockType === 'latestPosts' && block.enabled !== false
              ? [block.limit ?? 2]
              : [],
          ) ?? [],
      ),
    ),
  )
}
