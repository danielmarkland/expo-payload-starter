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
  if (!value || typeof value !== 'object') return 'Enter a hero heading.'
  const root = (value as { root?: { children?: Array<{ type?: string }> } })
    .root
  if (!Array.isArray(root?.children)) return 'Enter a hero heading.'
  const hasText = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') return false
    const entry = node as { text?: unknown; children?: unknown[] }
    return (
      (typeof entry.text === 'string' && Boolean(entry.text.trim())) ||
      (Array.isArray(entry.children) && entry.children.some(hasText))
    )
  }
  if (!root.children.some(hasText)) return 'Enter a hero heading.'
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
