import type {
  ApiRichText,
  ApiRichTextNode as LexicalNode,
} from '@danielmarkland/publishing-contracts'

export type PostHeading = {
  id: string
  level: 2 | 3
  text: string
}

export function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  return node.children?.map(nodeText).join('') || ''
}

export function headingID(
  text: string,
  occurrences: Map<string, number>,
): string {
  const base =
    text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  const occurrence = (occurrences.get(base) || 0) + 1
  occurrences.set(base, occurrence)
  return occurrence === 1 ? base : `${base}-${occurrence}`
}

export function extractPostHeadings(data: ApiRichText): PostHeading[] {
  const root = data.root
  const occurrences = new Map<string, number>()
  const headings: PostHeading[] = []

  for (const node of root?.children || []) {
    if (node.type !== 'heading' || (node.tag !== 'h2' && node.tag !== 'h3'))
      continue
    const text = nodeText(node).trim()
    if (!text) continue
    headings.push({
      id: headingID(text, occurrences),
      level: node.tag === 'h2' ? 2 : 3,
      text,
    })
  }

  return headings
}
