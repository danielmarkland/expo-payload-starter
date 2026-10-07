import { validateExternalURL } from './payloadFields.js'
import type { ArrayField, Field, SelectField } from 'payload'
import { choice, contactFields } from './presentationFields.js'

interface NavigationFieldOptions {
  navigationItemsField: (options: {
    includeIcons?: boolean
    label?: string
  }) => Field
}
interface HeaderFieldOptions extends NavigationFieldOptions {
  iconPickerFieldComponent: NonNullable<SelectField['admin']>['components']
  headerNavigationIconOptions: SelectField['options']
}
interface FooterFieldOptions extends NavigationFieldOptions {
  appearanceField: () => Field
  linkArrayPresentation: Pick<ArrayField, 'admin' | 'labels'>
  socialLinkFields: () => Field[]
  submitButtonFields: (variant: 'primary-filled') => Field[]
}

function optionalNavigationFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if ('fields' in field)
      return {
        ...field,
        fields: optionalNavigationFields(field.fields),
      } as Field
    if ('name' in field)
      return { ...field, required: false, defaultValue: undefined } as Field
    return field
  })
}

export function createHeaderNavigationFields({
  navigationItemsField,
  iconPickerFieldComponent,
  headerNavigationIconOptions,
}: HeaderFieldOptions): Field[] {
  return [
    choice('variant', ['standard', 'minimal']),
    {
      name: 'helpLink',
      type: 'group',
      fields: optionalNavigationFields(
        (navigationItemsField({ includeIcons: true }) as ArrayField).fields,
      ),
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: validateExternalURL,
        },
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: headerNavigationIconOptions,
          admin: { components: iconPickerFieldComponent },
        },
        { name: 'newTab', type: 'checkbox' },
      ],
    },
    navigationItemsField({ includeIcons: true }),
    {
      name: 'sticky',
      type: 'checkbox',
      admin: {
        description: 'Keep the header visible while the visitor scrolls.',
      },
      defaultValue: false,
      label: 'Sticky header',
    },
    {
      name: 'showSearch',
      type: 'checkbox',
      admin: {
        description:
          'Show the built-in Search link after the navigation items.',
      },
      defaultValue: true,
      label: 'Show search link',
      required: true,
    },
    {
      name: 'searchIcon',
      type: 'select',
      admin: {
        components: iconPickerFieldComponent,
        condition: (data) => data?.showSearch !== false,
        description: 'Optional icon that replaces the visible Search label.',
      },
      label: 'Search icon',
      options: headerNavigationIconOptions,
    },
  ]
}

export function createFooterNavigationFields({
  navigationItemsField,
  appearanceField,
  linkArrayPresentation,
  socialLinkFields,
  submitButtonFields,
}: FooterFieldOptions): Field[] {
  return [
    choice('layoutPreset', ['default', 'brand-details', 'stacked']),
    choice('detailsAlignment', ['start', 'end']),
    choice('socialPlacement', ['brand', 'details']),
    { name: 'details', type: 'textarea' },
    {
      type: 'collapsible',
      label: 'Newsletter CTA',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'newsletter',
          type: 'group',
          label: false,
          fields: [
            {
              name: 'show',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show newsletter signup on every page',
              required: true,
            },
            { name: 'eyebrow', type: 'text', defaultValue: 'Newsletter' },
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Stay in the loop',
              required: true,
            },
            {
              name: 'body',
              type: 'textarea',
              defaultValue: 'Get occasional updates delivered to your inbox.',
            },
            {
              name: 'groupId',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.show === true,
                description:
                  'MailerLite group ID. The API key remains server-side.',
              },
              validate: (
                value: null | string | undefined,
                { siblingData }: { siblingData: { show?: boolean } },
              ) =>
                siblingData?.show !== true ||
                (typeof value === 'string' && value.trim())
                  ? true
                  : 'A MailerLite group ID is required when newsletter signup is enabled.',
            },
            {
              name: 'submitLabel',
              type: 'text',
              defaultValue: 'Subscribe',
              required: true,
            },
            ...submitButtonFields('primary-filled'),
            {
              name: 'successMessage',
              type: 'text',
              defaultValue: 'Thanks for subscribing.',
              required: true,
            },
            {
              name: 'consentText',
              type: 'textarea',
              defaultValue:
                'By subscribing, you agree to receive email updates. Unsubscribe anytime.',
            },
            appearanceField(),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact form',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'contactForm',
          type: 'group',
          label: false,
          fields: [
            {
              name: 'show',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show contact form on every page',
              required: true,
            },
            { name: 'eyebrow', type: 'text', defaultValue: 'Contact' },
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'How can I help?',
              required: true,
            },
            { name: 'body', type: 'textarea' },
            ...contactFields(),
            {
              name: 'submitLabel',
              type: 'text',
              defaultValue: 'Send message',
              required: true,
            },
            ...submitButtonFields('primary-filled'),
            {
              name: 'successMessage',
              type: 'text',
              defaultValue: 'Thanks. Your message has been sent.',
              required: true,
            },
            appearanceField(),
          ],
        },
      ],
    },
    {
      name: 'tagline',
      type: 'textarea',
      admin: {
        description:
          'Short brand message. The site SEO description is used when this is empty.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      ...linkArrayPresentation,
      fields: socialLinkFields(),
    },
    navigationItemsField({
      includeIcons: true,
      label: 'Legal and utility links',
    }),
    {
      name: 'latestPosts',
      type: 'group',
      fields: [
        {
          name: 'limit',
          type: 'number',
          min: 1,
          max: 12,
          defaultValue: 2,
          validate: (value: number | null | undefined) =>
            value == null || Number.isInteger(value)
              ? true
              : 'Use a whole number.',
        },
        {
          name: 'show',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show latest posts',
          required: true,
        },
        {
          name: 'heading',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.show !== false,
          },
          defaultValue: 'Latest posts',
          required: true,
        },
      ],
    },
    {
      name: 'copyrightOwner',
      type: 'text',
      admin: { description: 'The site title is used when this is empty.' },
    },
  ]
}
