import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import {
  nodeText,
  headingID,
} from '@danielmarkland/publishing-core/postHeadings'

export function postHeadingConverters(): JSXConvertersFunction {
  const occurrences = new Map<string, number>()

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag)
        ? node.tag
        : 'h2'
      const Tag = tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const text = nodeText(node).trim()
      const id =
        (tag === 'h2' || tag === 'h3') && text
          ? headingID(text, occurrences)
          : undefined
      return <Tag id={id}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
  })
}
