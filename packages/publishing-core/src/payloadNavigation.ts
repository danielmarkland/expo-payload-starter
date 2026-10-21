import { validateExternalURL } from './payloadFields.js'
import type { ArrayField, Block, Field, SelectField } from 'payload'
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
  footerEditorComponent?: string

  newsletterDestinationField?: Field
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
    ...(['topBackground', 'scrolledBackground'] as const).map(
      (name): Field => ({
        name,
        type: 'select',
        label: name === 'topBackground' ? 'Header top' : 'Header scrolled',
        defaultValue: 'fill',
        options: [
          { label: 'Fill', value: 'fill' },
          { label: 'Transparent', value: 'transparent' },
        ],
        admin: {
          description:
            name === 'topBackground'
              ? 'Background at the top of the page. Transparent overlays a leading background hero.'
              : 'Background after scrolling more than 8px. Enable Sticky header to keep it visible.',
        },
      }),
    ),
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
  newsletterDestinationField = { name: 'destinationId', type: 'text' } as Field,
  footerEditorComponent = '@danielmarkland/publishing-ui/admin/FooterEditor#FooterEditor',
}: FooterFieldOptions): Field[] {
  const heading = (): Field => ({ name: 'heading', type: 'text' })
  const formFields = (newsletter: boolean): Field[] => [
    { name: 'eyebrow', type: 'text' },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: newsletter ? 'Stay in the loop' : 'How can I help?',
    },
    { name: 'body', type: 'textarea' },
    ...(newsletter
      ? [
          newsletterDestinationField,
          { name: 'consentText', type: 'textarea' } as Field,
        ]
      : contactFields()),
    {
      name: 'submitLabel',
      type: 'text',
      required: true,
      defaultValue: newsletter ? 'Subscribe' : 'Send message',
    },
    ...submitButtonFields('primary-filled'),
    {
      name: 'successMessage',
      type: 'text',
      required: true,
      defaultValue: newsletter
        ? 'Thanks for subscribing.'
        : 'Thanks. Your message has been sent.',
    },
    appearanceField(),
  ]
  const blocks: Block[] = [
    { slug: 'logo', labels: { singular: 'Logo', plural: 'Logos' }, fields: [] },
    {
      slug: 'text',
      labels: { singular: 'Formatted text', plural: 'Formatted text' },
      fields: [heading(), { name: 'content', type: 'richText' }],
    },
    {
      slug: 'links',
      labels: { singular: 'Navigation links', plural: 'Navigation links' },
      fields: [heading(), navigationItemsField({ includeIcons: true })],
    },
    {
      slug: 'socialLinks',
      labels: { singular: 'Social links', plural: 'Social links' },
      fields: [
        heading(),
        {
          name: 'items',
          type: 'array',
          ...linkArrayPresentation,
          fields: socialLinkFields(),
        },
      ],
    },
    {
      slug: 'callToAction',
      labels: { singular: 'Call to action', plural: 'Calls to action' },
      fields: [
        heading(),
        { name: 'body', type: 'textarea' },
        {
          name: 'action',
          type: 'group',
          fields: optionalNavigationFields(
            (navigationItemsField({ includeIcons: true }) as ArrayField).fields,
          ).concat([
            {
              name: 'variant',
              type: 'select',
              defaultValue: 'primary-filled',
              options: [
                'primary-filled',
                'primary-outline',
                'secondary-filled',
                'secondary-outline',
              ],
            },
          ]),
        },
      ],
    },
    {
      slug: 'latestPosts',
      labels: { singular: 'Latest posts', plural: 'Latest posts' },
      fields: [
        heading(),
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
      ],
    },
    {
      slug: 'copyright',
      labels: { singular: 'Copyright', plural: 'Copyright' },
      fields: [
        {
          name: 'owner',
          type: 'text',
          admin: {
            description:
              'The current year and site title are used automatically.',
          },
        },
      ],
    },
    {
      slug: 'newsletter',
      labels: { singular: 'Newsletter signup', plural: 'Newsletter signups' },
      fields: formFields(true),
    },
    {
      slug: 'contactForm',
      labels: { singular: 'Contact form', plural: 'Contact forms' },
      fields: formFields(false),
    },
  ]
  for (const block of blocks) {
    block.dbName = (
      {
        logo: 'ft_logo',
        text: 'ft_text',
        links: 'ft_links',
        socialLinks: 'ft_social',
        callToAction: 'ft_cta',
        latestPosts: 'ft_posts',
        copyright: 'ft_copy',
        newsletter: 'ft_nl',
        contactForm: 'ft_contact',
      } as Record<string, string>
    )[block.slug]
    block.fields.unshift({
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show this component',
    })
  }
  return [
    { name: 'title', type: 'text', defaultValue: 'Footer', required: true },
    choice('background', ['page', 'dark'], 'page'),
    {
      name: 'contentAreas',
      type: 'array',
      label: 'Footer content areas',
      admin: { components: { Field: footerEditorComponent } },
      fields: [
        { name: 'title', type: 'text', label: 'Area name' },
        appearanceField(),
        {
          name: 'columns',
          type: 'array',
          minRows: 1,
          maxRows: 4,
          required: true,
          defaultValue: [{ blocks: [] }],
          fields: [
            choice('alignment', ['start', 'center', 'end'], 'start'),
            { name: 'blocks', type: 'blocks', blocks },
          ],
        },
      ],
    },
  ]
}
