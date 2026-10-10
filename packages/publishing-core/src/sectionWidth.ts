import type { Field } from 'payload'

export type SectionWidth = 'full' | 'padded'
export type PageWidth = SectionWidth | 'site'
export type BlockWidth = SectionWidth | 'page'

/** Missing and null values inherit. */
export function resolveSectionWidth({
  site,
  page,
  block,
}: {
  site?: SectionWidth | null
  page?: PageWidth | null
  block?: BlockWidth | null
}): SectionWidth {
  const siteWidth = site || 'padded'
  const pageWidth = !page || page === 'site' ? siteWidth : page
  return !block || block === 'page' ? pageWidth : block
}

export function sectionWidthField(level: 'site' | 'page' | 'block'): Field {
  const inherited =
    level === 'site'
      ? []
      : [
          {
            label: level === 'page' ? 'Site' : 'Page',
            value: level === 'page' ? 'site' : 'page',
          },
        ]
  return {
    name: 'width',
    dbName: `pub_${level}_width`,
    type: 'select',
    defaultValue:
      level === 'site' ? 'padded' : level === 'page' ? 'site' : 'page',
    options: [
      ...inherited,
      { label: 'Full', value: 'full' },
      { label: 'Padded', value: 'padded' },
    ],
    admin: {
      description:
        'Full uses the available width. Padded aligns to the shared responsive container.',
    },
  }
}
