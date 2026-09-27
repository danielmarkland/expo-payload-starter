import type { Field, GlobalConfig } from 'payload'

import { brand, themes } from '@starter/design-tokens'

const validateHexColor = (value: null | string | undefined) =>
  !value || /^#[0-9a-fA-F]{6}$/.test(value) ? true : 'Enter a six-digit hex color such as #eec784.'

function colorField(name: string, label: string, defaultValue: string): Field {
  return {
    name,
    type: 'text',
    admin: { description: `${label} as a six-digit hexadecimal color.` },
    defaultValue,
    label,
    required: true,
    validate: validateHexColor,
  }
}

function paletteFields(mode: 'dark' | 'light'): Field[] {
  const palette = themes[mode]
  return [
    colorField('primary', 'Primary', palette.primary),
    colorField('primaryInk', 'Text on primary', palette.primaryInk),
    colorField('surface', 'Page background', palette.surface),
    colorField('surfaceRaised', 'Raised surface', palette.surfaceRaised),
    colorField('ink', 'Primary text', palette.ink),
    colorField('inkMuted', 'Muted text', palette.inkMuted),
    colorField('border', 'Borders', palette.border),
  ]
}

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Site settings',
  dbName: 'cms_site_settings',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      defaultValue: brand.siteTitle,
      required: true,
    },
    {
      name: 'appTitle',
      type: 'text',
      defaultValue: brand.appTitle,
      required: true,
    },
    {
      name: 'shortName',
      type: 'text',
      defaultValue: brand.shortName,
      maxLength: 12,
      required: true,
    },
    {
      name: 'lightLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Logo shown in light mode. The site title is used when this is empty.',
      },
      label: 'Light logo',
    },
    {
      name: 'darkLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Logo shown in dark mode. The site title is used when this is empty.',
      },
      label: 'Dark logo',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Website favicon and web-app manifest icon. Use a square PNG or SVG.',
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue: brand.description,
      admin: { description: 'Fallback description for pages without their own SEO description.' },
      required: true,
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        {
          name: 'defaultMode',
          type: 'select',
          admin: {
            description: 'Used when a visitor has not saved a light or dark preference.',
          },
          defaultValue: 'system',
          label: 'Default appearance',
          options: [
            { label: 'Follow system', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
          required: true,
        },
        {
          name: 'allowToggle',
          type: 'checkbox',
          defaultValue: true,
          required: true,
        },
        {
          name: 'fontPreset',
          type: 'select',
          defaultValue: 'poppins',
          options: [
            { label: 'Poppins', value: 'poppins' },
            { label: 'System sans', value: 'system' },
          ],
          required: true,
        },
        {
          name: 'shapePreset',
          type: 'select',
          defaultValue: 'soft',
          options: [
            { label: 'Square', value: 'square' },
            { label: 'Soft', value: 'soft' },
            { label: 'Rounded', value: 'rounded' },
          ],
          required: true,
        },
        {
          name: 'densityPreset',
          type: 'select',
          defaultValue: 'comfortable',
          options: [
            { label: 'Compact', value: 'compact' },
            { label: 'Comfortable', value: 'comfortable' },
            { label: 'Spacious', value: 'spacious' },
          ],
          required: true,
        },
        {
          name: 'light',
          type: 'group',
          fields: paletteFields('light'),
          label: 'Light palette',
        },
        {
          name: 'dark',
          type: 'group',
          fields: paletteFields('dark'),
          label: 'Dark palette',
        },
      ],
    },
  ],
}
