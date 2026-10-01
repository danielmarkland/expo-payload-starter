import {
  FixedToolbarFeature,
  ParagraphFeature,
  TextStateFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { themes } from '@danielmarkland/design-tokens'

export const heroHeadlineEditor: ReturnType<typeof lexicalEditor> =
  lexicalEditor({
    features: () => [
      ParagraphFeature(),
      FixedToolbarFeature(),
      TextStateFeature({
        state: {
          tone: {
            accent: { css: { color: themes.dark.primary }, label: 'Accent' },
          },
        },
      }),
    ],
  })

export function validateHeroHeadline(value: unknown) {
  if (!value || typeof value !== 'object') return true
  const root = (value as { root?: { children?: Array<{ type?: string }> } })
    .root
  if (!root?.children) return true
  return root.children.length === 1 && root.children[0]?.type === 'paragraph'
    ? true
    : 'Use a single paragraph. Press Shift+Enter to add a line break.'
}

export function createHeroHeadline(text: string, accentPhrases: string[] = []) {
  const phrases = [...new Set(accentPhrases.filter(Boolean))].sort(
    (left, right) => right.length - left.length,
  )
  const pattern = phrases.length
    ? new RegExp(
        `(${phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
        'g',
      )
    : null
  const parts = pattern ? text.split(pattern).filter(Boolean) : [text]
  return {
    root: {
      children: [
        {
          children: parts.map((part) => ({
            ...(phrases.includes(part) ? { $: { tone: 'accent' } } : {}),
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text: part,
            type: 'text' as const,
            version: 1,
          })),
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          type: 'paragraph' as const,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}
