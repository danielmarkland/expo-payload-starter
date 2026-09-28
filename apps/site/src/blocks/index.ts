import type { Block, Field } from 'payload'

import { heroHeadlineEditor, validateHeroHeadline } from '@/lib/heroHeadline'

const buttonFields = [
  { name: 'label', type: 'text' as const },
  { name: 'url', type: 'text' as const },
]

function optionalActionField(): Field {
  return {
    name: 'action',
    type: 'group',
    admin: { description: 'Optional single link shown after the section content.' },
    fields: buttonFields,
  }
}

const optionalAnchorField = {
  name: 'anchor',
  type: 'text' as const,
  admin: { description: 'Optional in-page anchor using lowercase letters, numbers, and hyphens.' },
  validate: (value: null | string | undefined) =>
    !value || /^[a-z][a-z0-9-]*$/.test(value)
      ? true
      : 'Use lowercase letters, numbers, and hyphens, starting with a letter.',
}

const optionalEyebrowField = {
  name: 'eyebrow',
  type: 'text' as const,
  admin: { description: 'Optional short label displayed above the section heading or content.' },
}

const spacingOptions = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra large', value: 'xl' },
]

const borderOptions = [
  { label: 'None', value: 'none' },
  { label: 'Default', value: 'default' },
  { label: 'Accent', value: 'accent' },
]

function appearanceField(): Field {
  return {
    name: 'appearance',
    type: 'group',
    admin: {
      description: 'Optional layout and surface overrides. Defaults use the site design system.',
    },
    fields: [
      {
        type: 'collapsible',
        label: 'Container and surface',
        admin: { initCollapsed: true },
        fields: [
          {
            name: 'contentWidth',
            type: 'select',
            dbName: 'cw',
            options: [
              { label: 'Site default', value: 'default' },
              { label: 'Text / narrow', value: 'text' },
              { label: 'Wide', value: 'wide' },
              { label: 'Full width', value: 'full' },
            ],
          },
          {
            name: 'background',
            type: 'select',
            dbName: 'bg',
            options: [
              { label: 'Default', value: 'default' },
              { label: 'Raised surface', value: 'raised' },
              { label: 'Accent', value: 'accent' },
              { label: 'Dark', value: 'dark' },
            ],
          },
          { name: 'rounded', type: 'checkbox', label: 'Rounded container' },
        ],
      },
      {
        type: 'collapsible',
        label: 'Spacing',
        admin: {
          description:
            'Base values: Small 16px, Medium 40px, Large 72px, Extra large 120px. The site density preset scales them.',
          initCollapsed: true,
        },
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'paddingTop', type: 'select', dbName: 'pt', options: spacingOptions },
              { name: 'paddingRight', type: 'select', dbName: 'pr', options: spacingOptions },
              { name: 'paddingBottom', type: 'select', dbName: 'pb', options: spacingOptions },
              { name: 'paddingLeft', type: 'select', dbName: 'pl', options: spacingOptions },
            ],
          },
          {
            type: 'row',
            fields: [
              { name: 'marginTop', type: 'select', dbName: 'mt', options: spacingOptions },
              { name: 'marginRight', type: 'select', dbName: 'mr', options: spacingOptions },
              { name: 'marginBottom', type: 'select', dbName: 'mb', options: spacingOptions },
              { name: 'marginLeft', type: 'select', dbName: 'ml', options: spacingOptions },
            ],
          },
        ],
      },
      {
        type: 'collapsible',
        label: 'Border',
        admin: {
          description:
            'Width applies to every enabled border side and stays fixed across density presets. Blank uses the 1px default.',
          initCollapsed: true,
        },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'borderTop',
                type: 'select',
                dbName: 'bt',
                options: [
                  { label: 'Default', value: 'default' },
                  { label: 'None', value: 'none' },
                  { label: 'Accent', value: 'accent' },
                ],
              },
              { name: 'borderRight', type: 'select', dbName: 'br', options: borderOptions },
              { name: 'borderBottom', type: 'select', dbName: 'bb', options: borderOptions },
              { name: 'borderLeft', type: 'select', dbName: 'bl', options: borderOptions },
              {
                name: 'borderWidth',
                type: 'select',
                dbName: 'bw',
                options: [
                  { label: 'Thin (1px)', value: 'thin' },
                  { label: 'Medium (2px)', value: 'medium' },
                  { label: 'Thick (4px)', value: 'thick' },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}

function withSectionFields(fields: Field[]): Field[] {
  const anchor = fields.find((field) => 'name' in field && field.name === 'anchor')
  const eyebrow = fields.find((field) => 'name' in field && field.name === 'eyebrow')
  const contentFields = fields.filter(
    (field) => !('name' in field && (field.name === 'anchor' || field.name === 'eyebrow')),
  )

  return [anchor || optionalAnchorField, eyebrow || optionalEyebrowField, ...contentFields]
}

function withAppearance(fields: Field[]): Field[] {
  return [...withSectionFields(fields), appearanceField()]
}

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { plural: 'Hero sections', singular: 'Hero' },
  fields: withAppearance([
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
  ]),
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { plural: 'Rich text sections', singular: 'Rich text' },
  fields: withAppearance([
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText', required: true },
  ]),
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { plural: 'Images', singular: 'Image' },
  fields: withAppearance([
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
  ]),
}

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  labels: { plural: 'Feature grids', singular: 'Feature grid' },
  fields: withAppearance([
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'cards',
      options: [
        { label: 'Cards', value: 'cards' },
        { label: 'Stacked', value: 'stacked' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    optionalActionField(),
  ]),
}

export const SplitContentBlock: Block = {
  slug: 'splitContent',
  labels: { plural: 'Split content sections', singular: 'Split content' },
  fields: withAppearance([
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
    optionalActionField(),
  ]),
}

export const LinkGridBlock: Block = {
  slug: 'linkGrid',
  labels: { plural: 'Link grids', singular: 'Link grid' },
  fields: withAppearance([
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
    optionalActionField(),
  ]),
}

export const PortfolioGridBlock: Block = {
  slug: 'portfolioGrid',
  labels: { plural: 'Portfolio grids', singular: 'Portfolio grid' },
  fields: withAppearance([
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
    optionalActionField(),
  ]),
}

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  labels: { plural: 'Call to action sections', singular: 'Call to action' },
  fields: withAppearance([
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonUrl', type: 'text', required: true },
  ]),
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { plural: 'Testimonial sections', singular: 'Testimonials' },
  fields: withAppearance([
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
  ]),
}

export const LogoCloudBlock: Block = {
  slug: 'logoCloud',
  labels: { plural: 'Logo clouds', singular: 'Logo cloud' },
  fields: withAppearance([
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
  ]),
}

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: { plural: 'Contact forms', singular: 'Contact form' },
  fields: withAppearance([
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
  ]),
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { plural: 'Statistics sections', singular: 'Statistics' },
  fields: withAppearance([
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
  ]),
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { plural: 'FAQ sections', singular: 'FAQ' },
  fields: withAppearance([
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
  ]),
}

export const LatestPostsBlock: Block = {
  slug: 'latestPosts',
  labels: { plural: 'Latest posts sections', singular: 'Latest posts' },
  fields: withAppearance([
    { name: 'heading', type: 'text', defaultValue: 'Latest posts' },
    { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 12 },
  ]),
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
