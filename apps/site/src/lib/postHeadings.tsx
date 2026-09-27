import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

type LexicalNode = {
  children?: LexicalNode[]
  tag?: string
  text?: string
  type?: string
}

export type PostHeading = {
  id: string
  level: 2 | 3
  text: string
}

function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  return node.children?.map(nodeText).join('') || ''
}

function headingID(text: string, occurrences: Map<string, number>): string {
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

export function extractPostHeadings(data: unknown): PostHeading[] {
  const root = (data as { root?: LexicalNode } | null)?.root
  const occurrences = new Map<string, number>()
  const headings: PostHeading[] = []

  for (const node of root?.children || []) {
    if (node.type !== 'heading' || (node.tag !== 'h2' && node.tag !== 'h3')) continue
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

export function postHeadingConverters(): JSXConvertersFunction {
  const occurrences = new Map<string, number>()

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2'
      const Tag = tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const text = nodeText(node as LexicalNode).trim()
      const id = (tag === 'h2' || tag === 'h3') && text ? headingID(text, occurrences) : undefined
      return <Tag id={id}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
  })
}
