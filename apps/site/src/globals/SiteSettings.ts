import type { Field, GlobalConfig } from 'payload'

import { brand, themes } from '@starter/design-tokens'
import { type PaletteColorName, validatePaletteColor } from '@/lib/colorContrast'

function colorField(name: PaletteColorName, label: string, defaultValue: string): Field {
  return {
    name,
    type: 'text',
    admin: {
      components: {
        Field: '@/components/admin/ColorPickerField#ColorPickerField',
      },
      width: '25%',
    },
    defaultValue,
    label,
    required: true,
    validate: validatePaletteColor(name),
  }
}

function paletteFields(mode: 'dark' | 'light'): Field[] {
  const palette = themes[mode]
  return [
    {
      type: 'row',
      fields: [
        colorField('primary', 'Primary', palette.primary),
        colorField('primaryInk', 'Text on primary', palette.primaryInk),
        colorField('accent', 'Accent', palette.secondary),
        colorField('surface', 'Page background', palette.surface),
        colorField('surfaceRaised', 'Raised surface', palette.surfaceRaised),
        colorField('ink', 'Primary text', palette.ink),
        colorField('inkMuted', 'Muted text', palette.inkMuted),
        colorField('border', 'Borders', palette.border),
      ],
    },
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
      type: 'tabs',
      tabs: [
        {
          label: 'General',
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
          ],
        },
        {
          label: 'Branding',
          fields: [
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
          ],
        },
        {
          label: 'Appearance',
          fields: [
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
            {
              name: 'buttons',
              type: 'group',
              label: 'Buttons',
              fields: [
                {
                  name: 'shape',
                  type: 'select',
                  admin: {
                    description:
                      'Controls button corners independently from the site-wide shape preset.',
                  },
                  defaultValue: 'square',
                  options: [
                    { label: 'Square', value: 'square' },
                    { label: 'Soft', value: 'soft' },
                    { label: 'Rounded', value: 'rounded' },
                    { label: 'Pill', value: 'pill' },
                  ],
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Integrations',
          fields: [
            {
              name: 'integrations',
              type: 'group',
              fields: [
                {
                  name: 'googleTagManagerId',
                  type: 'text',
                  admin: {
                    description: 'Optional GTM-… container shared by the website and Expo web.',
                  },
                  label: 'Google Tag Manager container ID',
                  validate: (value: null | string | undefined) =>
                    !value || /^GTM-[A-Z0-9]+$/i.test(value)
                      ? true
                      : 'Enter a GTM container ID such as GTM-ABC123.',
                },
                {
                  name: 'turnstileSiteKey',
                  type: 'text',
                  admin: {
                    description:
                      'Public Cloudflare Turnstile site key. The matching secret remains server-side.',
                  },
                  label: 'Turnstile site key',
                },
              ],
              label: 'Public integrations',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'siteDescription',
              type: 'textarea',
              defaultValue: brand.description,
              admin: {
                description: 'Fallback description for pages without their own SEO description.',
              },
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
