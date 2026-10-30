import type { Field } from 'payload'
import { titleCase } from './titleCase.js'
const label = (value: unknown): unknown =>
  typeof value === 'string'
    ? titleCase(value)
    : value &&
        typeof value === 'object' &&
        'en' in value &&
        typeof value.en === 'string'
      ? { ...value, en: titleCase(value.en) }
      : value
const titles = <T extends object>(labels: T | undefined): T | undefined =>
  labels &&
  (Object.fromEntries(
    Object.entries(labels).map(([key, value]) => [key, label(value)]),
  ) as T | undefined)
/** Normalize authored labels once; preserve values, options, descriptions and behavior. */
export function titleCaseFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    const next = { ...field }
    if ('label' in next && typeof next.label === 'string') {
      next.label = titleCase(next.label)
    } else if (
      'label' in next &&
      next.label &&
      typeof next.label === 'object' &&
      'en' in next.label &&
      typeof next.label.en === 'string'
    ) {
      next.label = { ...next.label, en: titleCase(next.label.en) }
    } else if (
      'name' in next &&
      next.type !== 'ui' &&
      next.label === undefined
    ) {
      next.label = titleCase(
        next.name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' '),
      )
    }
    if (next.type === 'tabs')
      next.tabs = next.tabs.map((tab) => ({
        ...tab,
        ...(typeof tab.label === 'string'
          ? { label: titleCase(tab.label) }
          : tab.label &&
              typeof tab.label === 'object' &&
              typeof tab.label.en === 'string'
            ? { label: { ...tab.label, en: titleCase(tab.label.en) } }
            : {}),
        fields: titleCaseFields(tab.fields),
      }))
    if (next.type === 'array') next.labels = titles(next.labels)
    if (next.type === 'blocks')
      next.blocks = next.blocks.map((block) =>
        typeof block === 'string'
          ? block
          : {
              ...block,
              labels: titles(block.labels),
              fields: titleCaseFields(block.fields),
            },
      )
    if ('fields' in next) next.fields = titleCaseFields(next.fields)
    return next
  })
}
