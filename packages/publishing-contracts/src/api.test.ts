import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { describe, expect, it } from 'vitest'
import {
  authorSchema,
  navigationSchema,
  pageSchema,
  postSchema,
  redirectsSchema,
  richTextSchema,
} from './api.js'
const richText = {
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [
          { type: 'text', version: 1, text: 'Hello', $: { tone: 'accent' } },
        ],
      },
    ],
  },
}
const document = { id: 1, slug: 'example', _status: 'published' }
const media = { id: 'media', alt: 'Cover', url: '/cover.jpg' }
const page = { id: 1, slug: 'home', title: 'Home' }
const blocks = [
  { blockType: 'hero', heading: richText },
  { blockType: 'richText', content: richText },
  { blockType: 'image', image: media },
  {
    blockType: 'featureGrid',
    heading: 'Features',
    items: [{ title: 'One', description: 'First' }],
  },
  {
    blockType: 'splitContent',
    heading: 'Split',
    content: richText,
    image: 1,
    imagePosition: 'left',
  },
  {
    blockType: 'linkGrid',
    heading: 'Links',
    items: [{ label: 'Home', type: 'page', page: document }],
  },
  {
    blockType: 'portfolioGrid',
    heading: 'Work',
    items: [{ name: 'Work', description: 'Example', url: '/' }],
  },
  {
    blockType: 'callToAction',
    heading: 'Act',
    action: { label: 'Go', url: '/' },
  },
  { blockType: 'testimonials', items: [{ name: 'Ada', quote: 'Great' }] },
  { blockType: 'logoCloud', items: [{ name: 'Logo', image: media }] },
  {
    blockType: 'contactForm',
    heading: 'Contact',
    submitLabel: 'Send',
    successMessage: 'Sent',
  },
  { blockType: 'stats', items: [{ value: '1', label: 'One' }] },
  { blockType: 'faq', items: [{ question: 'Why?', answer: 'Because' }] },
  { blockType: 'latestPosts' },
]
describe('content contracts', () => {
  it.each(blocks)('validates and preserves $blockType', (block) => {
    expect(pageSchema.parse({ ...page, layout: [block] }).layout[0]).toEqual(
      block,
    )
  })
  it('preserves additive fields and missing optional fields', () => {
    expect(
      pageSchema.parse({
        ...page,
        customCSS: '.x{}',
        tenant: 'a',
        layout: [{ ...blocks[0], customField: true }],
      }),
    ).toMatchObject({
      tenant: 'a',
      customCSS: '.x{}',
      layout: [{ customField: true }],
    })
    expect(
      pageSchema.parse({ ...page, layout: [{ blockType: 'faq' }] }).layout[0],
    ).toEqual({ blockType: 'faq' })
    expect(richTextSchema.parse(richText)).toEqual(richText)
  })
  it('accepts both ID types, populated references, null and omitted relationships', () => {
    for (const relationship of [1, 'id', document, null, undefined]) {
      const parsed = pageSchema.parse({
        ...page,
        layout: [
          {
            ...blocks[0],
            primaryButton: {
              type: 'page',
              page: relationship,
              post: relationship,
            },
          },
        ],
      })
      expect(parsed.layout[0]).toMatchObject({
        primaryButton: { page: relationship, post: relationship },
      })
    }
    for (const image of [1, 'id', media, null, undefined]) {
      expect(
        authorSchema.parse({ id: 1, slug: 'ada', name: 'Ada', image }).image,
      ).toEqual(image)
    }
  })
  it('validates complete posts and draft previews with populated and unresolved taxonomy', () => {
    const author = { id: 1, slug: 'ada', name: 'Ada' }
    const taxonomy = { id: 1, slug: 'news', title: 'News' }
    for (const status of ['draft', 'published']) {
      const post = {
        ...document,
        title: 'Post',
        summary: 'Summary',
        _status: status,
        body: richText,
        author,
        categories: [1, 'category', taxonomy],
        tags: [1, 'tag', taxonomy],
        showTableOfContents: true,
        meta: { title: 'SEO', description: 'Description', image: media },
      }
      expect(postSchema.parse(post)).toEqual(post)
    }
    expect(
      postSchema.parse({
        ...document,
        title: 'Post',
        summary: 'Summary',
        body: richText,
      }).author,
    ).toBeUndefined()
  })
  it('validates navigation and reference/custom redirects', () => {
    const navigation = {
      header: {
        showSearch: true,
        items: [{ label: 'Home', type: 'page', page: document }],
      },
      footer: { items: null },
    }
    expect(navigationSchema.parse(navigation)).toEqual(navigation)
    for (const value of [1, 'id', document]) {
      for (const relationTo of ['pages', 'posts']) {
        const redirect = {
          from: '/old',
          type: '301',
          to: { type: 'reference', reference: { relationTo, value } },
        }
        expect(
          redirectsSchema.parse({ redirects: [redirect] }).redirects[0],
        ).toEqual(redirect)
      }
    }
    expect(
      redirectsSchema.parse({
        redirects: [
          { from: '/old', type: '302', to: { type: 'custom', url: '/new' } },
        ],
      }).redirects,
    ).toHaveLength(1)
  })
  it('rejects malformed consumed fields and nested rich text', () => {
    for (const block of [
      { blockType: 'unknown' },
      { blockType: 'hero', heading: {} },
      { blockType: 'featureGrid', heading: 'Features', items: [{ title: 1 }] },
      { blockType: 'image', image: { url: '/x' } },
      { blockType: 'faq', items: [{ question: 'Why?', answer: 1 }] },
    ]) {
      expect(pageSchema.safeParse({ ...page, layout: [block] }).success).toBe(
        false,
      )
    }
    expect(
      richTextSchema.safeParse({
        root: {
          ...richText.root,
          children: [{ type: 'paragraph', version: 1, children: [null] }],
        },
      }).success,
    ).toBe(false)
    expect(
      navigationSchema.safeParse({
        header: { showSearch: true, items: [{ label: 1 }] },
        footer: {},
      }).success,
    ).toBe(false)
    expect(
      postSchema.safeParse({
        ...document,
        title: 'Post',
        summary: 'Summary',
        body: richText,
        author: {},
      }).success,
    ).toBe(false)
    expect(
      redirectsSchema.safeParse({ redirects: [{ from: '/old', type: 'bad' }] })
        .success,
    ).toBe(false)
  })
})

it('documents recursive rich-text cards without expanding the tree indefinitely', () => {
  const registry = new OpenAPIRegistry()
  registry.register('PublishingPage', pageSchema)
  const document = new OpenApiGeneratorV3(
    registry.definitions,
  ).generateDocument({
    openapi: '3.0.0',
    info: { title: 'Publishing', version: '1' },
  })
  expect(document.components?.schemas?.PublishingRichTextNode).toBeDefined()
  expect(JSON.stringify(document)).toContain(
    '#/components/schemas/PublishingRichTextNode',
  )
})
