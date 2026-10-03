import type { ArrayField, Field, SelectField } from 'payload'
import { buttonVariantOptions, type ButtonVariant } from './buttonVariants.js'

export interface PublishingFieldOptions {
  linkIconOptions: SelectField['options']
  socialIconOptions: SelectField['options']
  iconPickerFieldComponent: NonNullable<SelectField['admin']>['components']
  linkRowLabel: NonNullable<
    NonNullable<ArrayField['admin']>['components']
  >['RowLabel']
}

export function validateSafeURL(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return 'Enter a URL.'
  if (
    /^#[a-z][a-z0-9-]*$/.test(value) ||
    (value.startsWith('/') && !value.startsWith('//'))
  ) {
    return true
  }
  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(
      new URL(value).protocol,
    )
      ? true
      : 'Use a relative path, https, mailto, or tel URL.'
  } catch {
    return 'Use a relative path, https, mailto, or tel URL.'
  }
}

export function validateExternalURL(value: unknown) {
  if (typeof value !== 'string')
    return 'Enter a valid https, mailto, or tel URL.'
  try {
    return ['https:', 'mailto:', 'tel:'].includes(new URL(value).protocol)
      ? true
      : 'Enter a valid https, mailto, or tel URL.'
  } catch {
    return 'Enter a valid https, mailto, or tel URL.'
  }
}

export function createPublishingFields({
  linkIconOptions,
  socialIconOptions,
  iconPickerFieldComponent,
  linkRowLabel,
}: PublishingFieldOptions) {
  const linkArrayPresentation = {
    admin: {
      className: 'compact-link-array',
      components: { RowLabel: linkRowLabel },
    },
    labels: { plural: 'Links', singular: 'Link' },
  } satisfies Pick<ArrayField, 'admin' | 'labels'>
  function isCustomURL(
    _data: unknown,
    siblingData: Record<string, unknown> | undefined,
  ) {
    return siblingData?.type === 'url'
  }

  function withWidth(field: Field, width: string, className?: string): Field {
    const admin = 'admin' in field ? field.admin : undefined
    const existingClassName =
      admin && 'className' in admin ? admin.className : undefined

    return {
      ...field,
      admin: {
        ...('admin' in field ? field.admin : undefined),
        className:
          [existingClassName, className].filter(Boolean).join(' ') || undefined,
        width,
      },
    } as Field
  }

  function destinationFields({
    defaultType = 'page',
    required = false,
  }: { defaultType?: 'page' | 'url'; required?: boolean } = {}): Field[] {
    return [
      {
        name: 'type',
        type: 'select',
        defaultValue: defaultType,
        label: 'Destination type',
        options: [
          { label: 'Page', value: 'page' },
          { label: 'Post', value: 'post' },
          { label: 'Custom URL', value: 'url' },
        ],
        required,
      },
      {
        name: 'page',
        type: 'relationship',
        relationTo: 'pages',
        admin: { condition: (_, siblingData) => siblingData?.type === 'page' },
      },
      {
        name: 'post',
        type: 'relationship',
        relationTo: 'posts',
        admin: { condition: (_, siblingData) => siblingData?.type === 'post' },
      },
      {
        name: 'url',
        type: 'text',
        label: 'Custom URL',
        admin: {
          condition: isCustomURL,
          description: 'Use a relative path, https, mailto, or tel URL.',
        },
        validate: (
          value: unknown,
          { siblingData }: { siblingData: Record<string, unknown> },
        ) =>
          siblingData.type !== 'url' || !value ? true : validateSafeURL(value),
      },
      {
        name: 'newTab',
        type: 'checkbox',
        defaultValue: false,
        label: 'New tab',
        admin: { condition: isCustomURL },
      },
    ]
  }

  function iconFields({
    allowIconOnly = false,
  }: { allowIconOnly?: boolean } = {}): Field[] {
    return [
      {
        name: 'icon',
        type: 'select',
        options: linkIconOptions.map((option) =>
          typeof option === 'string' ? option : { ...option },
        ),
        admin: {
          components: iconPickerFieldComponent,
          description: 'Optional icon displayed with the link label.',
        },
      },
      ...(allowIconOnly
        ? [
            {
              name: 'iconOnly',
              type: 'checkbox' as const,
              defaultValue: false,
              label: 'Show only the icon',
              admin: {
                condition: (
                  _data: unknown,
                  siblingData: Record<string, unknown> | undefined,
                ) => Boolean(siblingData?.icon),
                description: 'The label remains available to screen readers.',
              },
            },
          ]
        : [
            {
              name: 'iconPosition',
              type: 'select' as const,
              defaultValue: 'right',
              label: 'Icon position',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
              admin: {
                condition: (
                  _data: unknown,
                  siblingData: Record<string, unknown> | undefined,
                ) => Boolean(siblingData?.icon),
              },
            },
          ]),
    ]
  }

  function linkFields({
    allowIconOnly = false,
    defaultType = 'page',
    destinationRequired,
    includeIcon = true,
    includeLabel = true,
    required = false,
  }: {
    allowIconOnly?: boolean
    defaultType?: 'page' | 'url'
    destinationRequired?: boolean
    includeIcon?: boolean
    includeLabel?: boolean
    required?: boolean
  } = {}): Field[] {
    const [destinationType, ...destinationInputs] = destinationFields({
      defaultType,
      required: destinationRequired ?? required,
    })
    const [icon, iconPresentation] = includeIcon
      ? iconFields({ allowIconOnly })
      : []
    const widths = includeIcon
      ? {
          destination: '26%',
          icon: '16%',
          label: '18%',
          newTab: '12%',
          presentation: '12%',
          type: '16%',
        }
      : { destination: '38%', label: '24%', newTab: '18%', type: '20%' }

    return [
      {
        type: 'row',
        admin: { className: 'compact-link-row' },
        fields: [
          ...(includeLabel
            ? [
                withWidth(
                  { name: 'label', type: 'text' as const, required },
                  widths.label,
                ),
              ]
            : []),
          ...(destinationType ? [withWidth(destinationType, widths.type)] : []),
          ...(icon && widths.icon
            ? [withWidth(icon, widths.icon, 'compact-link-row__icon')]
            : []),
          ...destinationInputs.map((field) =>
            withWidth(
              field,
              'name' in field && field.name === 'newTab'
                ? widths.newTab
                : widths.destination,
              'name' in field && field.name === 'newTab'
                ? 'compact-link-row__new-tab'
                : undefined,
            ),
          ),
          ...(iconPresentation && widths.presentation
            ? [withWidth(iconPresentation, widths.presentation)]
            : []),
        ],
      },
    ]
  }

  function actionFields(
    defaultVariant: ButtonVariant,
    { required = false }: { required?: boolean } = {},
  ): Field[] {
    const [row] = linkFields({ required })
    if (!row || row.type !== 'row') return []

    const widths: Record<string, string> = {
      icon: '14%',
      iconPosition: '12%',
      label: '16%',
      newTab: '10%',
      page: '22%',
      post: '22%',
      type: '14%',
      url: '22%',
    }

    return [
      {
        type: 'row',
        admin: { className: 'compact-link-row' },
        fields: [
          ...row.fields.map((field) => {
            const width =
              'name' in field && field.name ? widths[field.name] : undefined
            return width ? withWidth(field, width) : field
          }),
          {
            name: 'variant',
            type: 'select',
            admin: { width: '12%' },
            defaultValue: defaultVariant,
            label: 'Button style',
            options: buttonVariantOptions,
          },
        ],
      },
    ]
  }

  function submitButtonFields(defaultVariant: ButtonVariant): Field[] {
    const [icon, iconPosition] = iconFields()

    return [
      {
        type: 'row',
        admin: { className: 'compact-link-row' },
        fields: [
          ...(icon ? [withWidth(icon, '34%', 'compact-link-row__icon')] : []),
          ...(iconPosition ? [withWidth(iconPosition, '33%')] : []),
          {
            name: 'submitButtonVariant',
            type: 'select',
            admin: { width: '33%' },
            defaultValue: defaultVariant,
            label: 'Button style',
            options: buttonVariantOptions,
          },
        ],
      },
    ]
  }

  function socialLinkFields(): Field[] {
    return [
      {
        type: 'row',
        admin: { className: 'compact-link-row' },
        fields: [
          {
            name: 'label',
            type: 'text',
            admin: { width: '25%' },
            required: true,
          },
          {
            name: 'icon',
            type: 'select',
            admin: {
              className: 'compact-link-row__icon',
              components: iconPickerFieldComponent,
              width: '20%',
            },
            options: socialIconOptions,
            required: true,
          },
          {
            name: 'url',
            type: 'text',
            admin: {
              description: 'Use an https, mailto, or tel URL.',
              width: '40%',
            },
            required: true,
            validate: validateExternalURL,
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: { className: 'compact-link-row__new-tab', width: '15%' },
            defaultValue: true,
            label: 'New tab',
          },
        ],
      },
    ]
  }

  return {
    actionFields,
    destinationFields,
    iconFields,
    linkFields,
    socialLinkFields,
    submitButtonFields,
    linkArrayPresentation,
    iconPickerFieldComponent,
  }
}
