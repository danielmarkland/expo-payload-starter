import { sectionWidthField } from './sectionWidth.js'
import type { Field } from 'payload'
import { choice, archiveFields } from './presentationFields.js'
import { themes } from '@danielmarkland/design-tokens'
import { type PaletteColorName, validatePaletteColor } from './colorContrast.js'

export function createSiteSettingsFields({
  colorPickerFieldComponent,
  defaults = {},
}: {
  colorPickerFieldComponent: string
  defaults?: {
    siteTitle?: string
    appTitle?: string
    shortName?: string
    description?: string
  }
}): Field[] {
  function colorField(
    name: PaletteColorName,
    label: string,
    defaultValue: string,
  ): Field {
    return {
      name,
      type: 'text',
      admin: {
        components: {
          Field: colorPickerFieldComponent,
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
          colorField('darkSurface', 'Dark section background', '#0f0f0f'),
          colorField('darkInk', 'Dark section text', '#ffffff'),
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

  return [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            sectionWidthField('site'),
            {
              name: 'siteTitle',
              type: 'text',
              defaultValue: defaults.siteTitle,
              required: true,
            },
            {
              name: 'appTitle',
              type: 'text',
              defaultValue: defaults.appTitle,
              required: true,
            },
            {
              name: 'shortName',
              type: 'text',
              defaultValue: defaults.shortName,
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
                description:
                  'Logo shown in light mode. The site title is used when this is empty.',
              },
              label: 'Light logo',
            },
            {
              name: 'darkLogo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Logo shown in dark mode. The site title is used when this is empty.',
              },
              label: 'Dark logo',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Website favicon and web-app manifest icon. Use a square PNG or SVG.',
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
                    description:
                      'Used when a visitor has not saved a light or dark preference.',
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
                    { label: 'Inter', value: 'inter' },
                    { label: 'IBM Plex Mono', value: 'ibm-plex-mono' },
                  ],
                  required: true,
                },
                ...['headingFont', 'bodyFont', 'labelFont'].map((name) =>
                  choice(name, ['system', 'poppins', 'inter', 'ibm-plex-mono']),
                ),
                choice('headingWeight', ['600', '700', '800']),
                choice('typographyPreset', [
                  'compact',
                  'standard',
                  'editorial',
                ]),
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
        { label: 'Archives', fields: [archiveFields()] },
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
                    description:
                      'Optional GTM-… container shared by the website and Expo web.',
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
              defaultValue: defaults.description,
              admin: {
                description:
                  'Fallback description for pages without their own SEO description.',
              },
              required: true,
            },
          ],
        },
      ],
    },
  ]
}
