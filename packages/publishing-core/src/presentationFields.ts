import type { Field } from 'payload'
export function choice(
  name: string,
  values: string[],
  defaultValue?: string,
): Field {
  return {
    name,
    dbName:
      name === 'presentation'
        ? values.includes('imageOnly')
          ? 'pub_post_presentation'
          : 'pub_archive_presentation'
        : (
            {
              mobileColumns: 'mc',
              innerWidth: 'iw',
              cardPadding: 'cp',
              headingSpacing: 'hs',
              headingAlignment: 'pub_heading_align',
              actionAlignment: 'pub_action_align',
              columns: 'pub_columns',
              imageProportion: 'pub_image_proportion',
              titleAlignment: 'pub_title_align',
              titleSurface: 'pub_title_surface',
              listSurface: 'pub_list_surface',
            } as Record<string, string>
          )[name],
    type: 'select',
    options: values.map((value) => ({
      label: value.charAt(0).toUpperCase() + value.slice(1),
      value,
    })),
    ...(defaultValue ? { defaultValue } : {}),
  }
}
export function contactFields(): Field[] {
  return [
    choice('nameMode', ['combined', 'separate']),
    { name: 'showCompany', type: 'checkbox' },
  ]
}
export function archiveFields(): Field {
  return {
    name: 'archive',
    type: 'group',
    fields: [
      {
        name: 'pageSize',
        type: 'number',
        min: 1,
        max: 48,
        defaultValue: 12,
        validate: (value: number | null | undefined) =>
          value == null || Number.isInteger(value)
            ? true
            : 'Use a whole number.',
      },
      choice('columns', ['auto', '2', '3', '4']),
      choice('imageProportion', ['landscape', 'square', 'original']),
      choice('presentation', ['card', 'simple']),
      choice('titleAlignment', ['left', 'center']),
      choice('titleSurface', ['default', 'raised', 'accent', 'dark', 'light']),
      choice('listSurface', ['default', 'raised', 'accent', 'dark', 'light']),
    ],
  }
}
