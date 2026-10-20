import type {
  ApiFooterNavigation,
  FooterContentArea,
  FooterContentBlock,
  ApiLink,
} from '@danielmarkland/publishing-contracts'

type LegacyFooter = {
  background?: 'page' | 'dark' | null
  layoutPreset?: string | null
  detailsAlignment?: 'start' | 'end' | null
  socialPlacement?: string | null
  details?: string | null
  tagline?: string | null
  copyrightOwner?: string | null
  items?: ApiLink[]
  socialLinks?: {
    id?: string | null
    label: string
    url: string
    icon: string
    newTab?: boolean | null
  }[]
  newsletter?: Record<string, unknown>
  contactForm?: Record<string, unknown>
  latestPosts?: {
    show?: boolean | null
    heading?: string | null
    limit?: number | null
  }
}
const camel = (value: string) =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())

/** Read-only decoding of the retired SQL layout, used only by the migration. */
export function legacyFooterFromSQL(
  row: Record<string, unknown>,
  items: Record<string, unknown>[],
  socialLinks: Record<string, unknown>[],
): LegacyFooter {
  const group = (prefix: string) => {
    const result: Record<string, unknown> = {}
    const appearance: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row))
      if (key.startsWith(prefix)) {
        const name = key.slice(prefix.length)
        if (name.startsWith('appearance_'))
          appearance[camel(name.slice(11))] = value
        else result[camel(name)] = value
      }
    if (Object.keys(appearance).length) result.appearance = appearance
    return result
  }
  const decodeItem = (item: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(item)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => [
          key === 'page_id' ? 'page' : key === 'post_id' ? 'post' : camel(key),
          value,
        ]),
    )
  return {
    background: row.background as LegacyFooter['background'],
    layoutPreset: row.layout_preset as string | null,
    detailsAlignment: row.details_alignment as LegacyFooter['detailsAlignment'],
    socialPlacement: row.social_placement as string | null,
    details: row.details as string | null,
    tagline: row.tagline as string | null,
    copyrightOwner: row.copyright_owner as string | null,
    items: items.map(decodeItem) as ApiLink[],
    socialLinks: socialLinks.map(decodeItem) as NonNullable<
      LegacyFooter['socialLinks']
    >,
    newsletter: group('newsletter_'),
    contactForm: group('contact_form_'),
    latestPosts: group('latest_posts_'),
  }
}
export function footerTextContent(text: string) {
  return {
    root: {
      type: 'root' as const,
      version: 1,
      direction: null,
      format: '' as const,
      indent: 0,
      children: text.split('\n').map((line) => ({
        type: 'paragraph',
        version: 1,
        direction: null,
        format: '',
        indent: 0,
        children: line
          ? [
              {
                type: 'text',
                version: 1,
                text: line,
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
              },
            ]
          : [],
      })),
    },
  }
}

/** One-time conversion; the public renderer never reads the retired layout. */
export function migrateFooterNavigation(
  legacy: LegacyFooter,
  identity: { siteTitle: string; description: string },
  id: () => string = () => crypto.randomUUID(),
): ApiFooterNavigation {
  const block = (value: Record<string, unknown>) =>
    ({ ...value, id: id() }) as FooterContentBlock
  const area = (
    title: string,
    blocks: FooterContentBlock[],
  ): FooterContentArea => ({
    id: id(),
    title,
    appearance: { paddingTop: 'lg', paddingBottom: 'lg' },
    columns: [{ id: id(), alignment: 'start', blocks }],
  })
  const contentAreas: FooterContentArea[] = []
  for (const kind of ['newsletter', 'contactForm'] as const) {
    const form = legacy[kind]
    if (!form || !Object.keys(form).length) continue
    const { show, ...settings } = form
    contentAreas.push(
      area(kind === 'newsletter' ? 'Newsletter' : 'Contact', [
        block({ ...settings, blockType: kind, enabled: show === true }),
      ]),
    )
  }
  const brand = [
    block({ blockType: 'logo' }),
    block({
      blockType: 'text',
      content: footerTextContent(legacy.tagline || identity.description),
    }),
  ]
  const details: FooterContentBlock[] = []
  if (legacy.details)
    details.push(
      block({ blockType: 'text', content: footerTextContent(legacy.details) }),
    )
  if (legacy.socialLinks?.length)
    (legacy.socialPlacement === 'details' ? details : brand).push(
      block({ blockType: 'socialLinks', items: legacy.socialLinks }),
    )
  if (legacy.items?.length)
    brand.push(block({ blockType: 'links', items: legacy.items }))
  const copyright = block({
    blockType: 'copyright',
    owner: legacy.copyrightOwner || identity.siteTitle,
  })
  const separateDetails = Boolean(
    (legacy.layoutPreset && legacy.layoutPreset !== 'default') ||
    legacy.details ||
    legacy.socialPlacement === 'details',
  )
  if (separateDetails) details.push(copyright)
  const main = area('Footer', brand)
  if (details.length)
    main.columns.push({
      id: id(),
      alignment: legacy.detailsAlignment || 'end',
      blocks: details,
    })
  if (legacy.latestPosts?.show !== false)
    main.columns.push({
      id: id(),
      alignment: 'start',
      blocks: [
        block({
          blockType: 'latestPosts',
          heading: legacy.latestPosts?.heading || 'Latest posts',
          limit: legacy.latestPosts?.limit || 2,
        }),
      ],
    })
  if (legacy.layoutPreset === 'stacked') {
    for (const column of main.columns)
      contentAreas.push({ ...main, id: id(), columns: [column] })
  } else contentAreas.push(main)
  if (!separateDetails) contentAreas.push(area('Copyright', [copyright]))
  return {
    title: legacy.copyrightOwner || identity.siteTitle,
    background: legacy.background,
    contentAreas,
  }
}
