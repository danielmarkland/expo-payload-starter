import type { Field } from 'payload'
import { richTextSchema } from '@danielmarkland/publishing-contracts'
import type { SiteTransferManifest } from '@danielmarkland/publishing-contracts/siteTransfer'
import { projectState, setPath } from './siteTransfer/fields.js'
import type { TransferResource } from './siteTransfer/payload.js'
import { validateExternalURL, validateSafeURL } from './payloadFields.js'

/** Portable descriptions contain no hooks, credentials, editor components or app code. */
export interface DesignField {
  name: string
  type: string
  required?: boolean
  defaultValue?: unknown
  options?: string[]
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  minRows?: number
  maxRows?: number
  hasMany?: boolean
  relationTo?: string | string[]
  description?: string
  fields?: DesignField[]
  blocks?: { slug: string; fields: DesignField[] }[]
}
export interface DesignResource {
  key: string
  slug: string
  kind: 'collection' | 'global'
  drafts: boolean
  media: boolean
  excludedPaths: string[]
  fields: DesignField[]
}
export interface DesignDiagnostic {
  record: string
  path: string
  message: string
}
export function describeDesignFields(fields: Field[]): DesignField[] {
  return fields.flatMap((field): DesignField[] => {
    if (field.type === 'tabs')
      return field.tabs.flatMap((tab) =>
        'name' in tab && tab.name
          ? [
              {
                name: tab.name,
                type: 'group',
                fields: describeDesignFields(tab.fields),
              },
            ]
          : describeDesignFields(tab.fields),
      )
    if (!('name' in field))
      return 'fields' in field ? describeDesignFields(field.fields) : []
    if (
      ['ui', 'join'].includes(field.type) ||
      ['id', 'createdAt', 'updatedAt', '_status'].includes(field.name)
    )
      return []
    const output: DesignField = { name: field.name, type: field.type }
    for (const key of [
      'required',
      'defaultValue',
      'min',
      'max',
      'minLength',
      'maxLength',
      'minRows',
      'maxRows',
      'hasMany',
      'relationTo',
    ] as const) {
      if (key in field) {
        const value = (field as unknown as Record<string, unknown>)[key]
        if (value !== undefined && typeof value !== 'function')
          Object.assign(output, { [key]: value })
      }
    }
    if ('options' in field)
      output.options = field.options.map((option) =>
        typeof option === 'string' ? option : String(option.value),
      )
    if (
      field.admin &&
      'description' in field.admin &&
      typeof field.admin.description === 'string'
    )
      output.description = field.admin.description
    if ('fields' in field) output.fields = describeDesignFields(field.fields)
    if (field.type === 'blocks')
      output.blocks = field.blocks.map((block) => {
        if (typeof block === 'string')
          throw new Error(
            'Resolve block references before describing capabilities',
          )
        return { slug: block.slug, fields: describeDesignFields(block.fields) }
      })
    return [output]
  })
}
export function describeDesignResources(
  resources: TransferResource[],
): DesignResource[] {
  return resources.map((resource) => ({
    key: resource.key,
    slug: resource.slug,
    kind: resource.kind,
    drafts: Boolean(resource.drafts),
    media: Boolean(resource.media),
    excludedPaths: resource.excludedPaths || [],
    fields: describeDesignFields(resource.fields),
  }))
}
/** Reconstitute only field metadata needed by the existing portable archive validator. */
export function designTransferResources(
  resources: DesignResource[],
): TransferResource[] {
  return resources.map((resource) => ({
    ...resource,
    fields: resource.fields as Field[],
  }))
}
export function validateDesignRecords(
  manifest: SiteTransferManifest,
  resources: DesignResource[],
): DesignDiagnostic[] {
  const diagnostics: DesignDiagnostic[] = []
  const byKey = new Map(manifest.records.map((record) => [record.key, record]))
  for (const resource of resources) {
    const records = manifest.records.filter(
      (record) => record.resource === resource.key,
    )
    const identities = new Set<string>()
    for (const record of records) {
      for (const stateName of ['current', 'published'] as const) {
        const state = record[stateName]
        if (!state) continue
        const data: Record<string, unknown> = structuredClone(state.data)
        const add = (path: string, message: string) =>
          diagnostics.push({
            record: record.key,
            path: `${stateName}.data.${path}`,
            message,
          })
        try {
          const paths = new Set<string>()
          for (const ref of state.references) {
            const path = JSON.stringify(ref.path)
            if (paths.has(path))
              throw new Error(`Duplicate reference path ${ref.path.join('.')}`)
            paths.add(path)
            if (!byKey.has(ref.target))
              throw new Error(
                `Unresolved reference ${ref.target} at ${ref.path.join('.')}`,
              )
            setPath(data, ref.path, ref.target)
          }
          projectState(
            data,
            resource.fields as Field[],
            (slug, id) => {
              if (byKey.get(String(id))?.resource !== slug)
                throw new Error(`Relationship ${id} must target ${slug}`)
              return String(id)
            },
            resource.excludedPaths,
            true,
          )
        } catch (error) {
          add('', error instanceof Error ? error.message : String(error))
          continue
        }
        function walk(
          object: Record<string, unknown>,
          fields: DesignField[],
          prefix = '',
        ) {
          for (const field of fields) {
            const path = prefix + field.name
            if (resource.excludedPaths.includes(path)) continue
            const value = object[field.name]
            if (value === undefined || value === null || value === '') {
              if (field.required && field.defaultValue === undefined)
                add(path, 'Required value is missing')
              continue
            }
            if (
              typeof value === 'string' &&
              ((field.minLength !== undefined &&
                value.length < field.minLength) ||
                (field.maxLength !== undefined &&
                  value.length > field.maxLength))
            )
              add(
                path,
                `Expected text length between ${field.minLength ?? 0} and ${field.maxLength ?? 'unlimited'}`,
              )
            if (
              ['limit', 'pageSize'].includes(field.name) &&
              typeof value === 'number' &&
              !Number.isInteger(value)
            )
              add(path, 'Expected an integer limit')
            if (
              field.options &&
              !(field.hasMany
                ? Array.isArray(value) &&
                  value.every((v) => field.options!.includes(String(v)))
                : field.options.includes(String(value)))
            )
              add(path, `Expected one of: ${field.options.join(', ')}`)
            if (
              field.type === 'number' &&
              (typeof value !== 'number' ||
                !Number.isFinite(value) ||
                (field.min !== undefined && value < field.min) ||
                (field.max !== undefined && value > field.max))
            )
              add(
                path,
                `Expected finite number between ${field.min ?? '-∞'} and ${field.max ?? '∞'}`,
              )
            if (
              field.type === 'date' &&
              (typeof value !== 'string' || Number.isNaN(Date.parse(value)))
            )
              add(path, 'Expected an ISO date')
            if (field.type === 'richText') {
              const result = richTextSchema.safeParse(value)
              if (!result.success)
                for (const issue of result.error.issues)
                  add(`${path}.${issue.path.join('.')}`, issue.message)
              if (
                field.name === 'heading' &&
                result.success &&
                (result.data.root.children.length !== 1 ||
                  result.data.root.children[0]?.type !== 'paragraph')
              )
                add(
                  path,
                  'Hero heading requires one paragraph; use linebreak nodes for line breaks',
                )
            }
            if (
              field.name === 'anchor' &&
              (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/.test(value))
            )
              add(
                path,
                'Anchor must start with a lowercase letter and contain lowercase letters, numbers or hyphens',
              )
            if (
              field.name === 'customCSS' &&
              typeof value === 'string' &&
              /<\s*\/\s*style/i.test(value)
            )
              add(path, 'Closing style tags are not allowed')
            if (field.name === 'url') {
              const valid = path.includes('socialLinks')
                ? validateExternalURL(value)
                : validateSafeURL(value)
              if (valid !== true) add(path, valid)
            }
            if (
              field.name === 'type' &&
              ['page', 'post', 'url'].includes(String(value))
            ) {
              const destination = String(value)
              if (!object[destination])
                add(
                  prefix + destination,
                  'Selected link destination is missing',
                )
            }
            if (
              ['color', 'ruleColor'].includes(field.name) ||
              /^(primary|primaryInk|accent|surface|surfaceRaised|ink|inkMuted|border)$/.test(
                field.name,
              )
            ) {
              if (
                field.type === 'text' &&
                typeof value === 'string' &&
                !/^#[0-9a-f]{6}$/i.test(value)
              )
                add(path, 'Expected a six-digit hex color')
            }
            if (
              field.type === 'group' &&
              field.fields &&
              value &&
              typeof value === 'object' &&
              !Array.isArray(value)
            )
              walk(value as Record<string, unknown>, field.fields, path + '.')
            if (
              ['array', 'blocks'].includes(field.type) &&
              Array.isArray(value)
            ) {
              if (
                value.length < (field.minRows ?? 0) ||
                value.length > (field.maxRows ?? Infinity)
              )
                add(
                  path,
                  `Expected ${field.minRows ?? 0}–${field.maxRows ?? 'unlimited'} items`,
                )
              value.forEach((entry, index) => {
                const item = entry as Record<string, unknown>
                const children =
                  field.type === 'blocks'
                    ? field.blocks?.find(
                        (block) => block.slug === item.blockType,
                      )?.fields
                    : field.fields
                if (children) walk(item, children, `${path}.${index}.`)
              })
            }
          }
        }
        walk(data, resource.fields)
        if (stateName === 'current') {
          const identity =
            data.slug ??
            data.from ??
            (resource.key === 'landing-pages' ? data.surface : undefined)
          if (identity !== undefined) {
            if (identities.has(String(identity)))
              add('slug', `Duplicate resource identity ${identity}`)
            identities.add(String(identity))
          }
        }
      }
    }
  }
  return diagnostics
}
