import type { Block } from 'payload'

import { heroHeadlineEditor, validateHeroHeadline } from '@/lib/heroHeadline'

const buttonFields = [
  { name: 'label', type: 'text' as const },
  { name: 'url', type: 'text' as const },
]

const optionalAnchorField = {
  name: 'anchor',
  type: 'text' as const,
  admin: { description: 'Optional in-page anchor using lowercase letters, numbers, and hyphens.' },
  validate: (value: null | string | undefined) =>
    !value || /^[a-z][a-z0-9-]*$/.test(value)
      ? true
      : 'Use lowercase letters, numbers, and hyphens, starting with a letter.',
}

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { plural: 'Hero sections', singular: 'Hero' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    {
      name: 'heading',
      type: 'richText',
      admin: {
        description:
          'Select text and choose Accent from the toolbar. Use Shift+Enter for a line break.',
      },
      editor: heroHeadlineEditor,
      required: true,
      validate: validateHeroHeadline,
    },
    { name: 'secondaryHeading', type: 'text' },
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

export const SplitContentBlock: Block = {
  slug: 'splitContent',
  labels: { plural: 'Split content sections', singular: 'Split content' },
  fields: [
    optionalAnchorField,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
      required: true,
    },
  ],
}

export const LinkGridBlock: Block = {
  slug: 'linkGrid',
  labels: { plural: 'Link grids', singular: 'Link grid' },
  fields: [
    optionalAnchorField,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}

export const PortfolioGridBlock: Block = {
  slug: 'portfolioGrid',
  labels: { plural: 'Portfolio grids', singular: 'Portfolio grid' },
  fields: [
    optionalAnchorField,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'description', type: 'textarea', required: true },
        { name: 'url', type: 'text' },
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
    optionalAnchorField,
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: { plural: 'Contact forms', singular: 'Contact form' },
  fields: [
    {
      ...optionalAnchorField,
      defaultValue: 'contact',
    },
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'submitLabel', type: 'text', defaultValue: 'Send message', required: true },
    {
      name: 'successMessage',
      type: 'text',
      defaultValue: 'Thanks. Your message has been sent.',
      required: true,
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
  SplitContentBlock,
  LinkGridBlock,
  PortfolioGridBlock,
  CallToActionBlock,
  TestimonialsBlock,
  LogoCloudBlock,
  ContactFormBlock,
  StatsBlock,
  FAQBlock,
  LatestPostsBlock,
]
