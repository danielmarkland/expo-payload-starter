import type { Block } from 'payload'

const buttonFields = [
  { name: 'label', type: 'text' as const },
  { name: 'url', type: 'text' as const },
]

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { plural: 'Hero sections', singular: 'Hero' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    {
      name: 'primaryButton',
      type: 'group',
      required: false,
      fields: buttonFields,
    },
    {
      name: 'secondaryButton',
      type: 'group',
      required: false,
      fields: buttonFields,
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { plural: 'Rich text sections', singular: 'Rich text' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText', required: true },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { plural: 'Images', singular: 'Image' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
  ],
}

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  labels: { plural: 'Feature grids', singular: 'Feature grid' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
  ],
}

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  labels: { plural: 'Call to action sections', singular: 'Call to action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonUrl', type: 'text', required: true },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { plural: 'Testimonial sections', singular: 'Testimonials' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
      ],
    },
  ],
}

export const LogoCloudBlock: Block = {
  slug: 'logoCloud',
  labels: { plural: 'Logo clouds', singular: 'Logo cloud' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { plural: 'Statistics sections', singular: 'Statistics' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { plural: 'FAQ sections', singular: 'FAQ' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const LatestPostsBlock: Block = {
  slug: 'latestPosts',
  labels: { plural: 'Latest posts sections', singular: 'Latest posts' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Latest posts' },
    { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 12 },
  ],
}

export const pageBlocks = [
  HeroBlock,
  RichTextBlock,
  ImageBlock,
  FeatureGridBlock,
  CallToActionBlock,
  TestimonialsBlock,
  LogoCloudBlock,
  StatsBlock,
  FAQBlock,
  LatestPostsBlock,
]
