import type { Field } from 'payload'
import type {
  SiteTransferReference,
  SiteTransferState,
} from '@danielmarkland/publishing-contracts/siteTransfer'

type Json = SiteTransferState['data'][string]
type Path = SiteTransferReference['path']
export type ReferenceResolver = (
  resource: string,
  id: string | number,
) => string
const unsafe = new Set(['__proto__', 'constructor', 'prototype'])
const metadata = new Set([
  'id',
  'createdAt',
  'updatedAt',
  '_status',
  'globalType',
])
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected object')
  for (const key of Object.keys(value))
    if (unsafe.has(key)) throw new Error('Unsafe property')
  return value as Record<string, unknown>
}
export function json(value: unknown): Json {
  if (value === null || typeof value === 'boolean' || typeof value === 'string')
    return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (Array.isArray(value)) return value.map(json)
  return Object.fromEntries(
    Object.entries(object(value)).map(([k, v]) => [k, json(v)]),
  )
}
export function setPath(
  data: Record<string, unknown>,
  path: Path,
  value: unknown,
): void {
  let parent: unknown = data
  for (const part of path.slice(0, -1)) {
    if (typeof part === 'string' && unsafe.has(part))
      throw new Error('Unsafe reference path')
    if (!parent || typeof parent !== 'object' || !Object.hasOwn(parent, part))
      throw new Error('Missing reference path')
    parent = (parent as Record<string, unknown>)[part]
  }
  const last = path.at(-1)!
  if (typeof last === 'string' && unsafe.has(last))
    throw new Error('Unsafe reference path')
  if (!parent || typeof parent !== 'object' || !Object.hasOwn(parent, last))
    throw new Error('Missing reference path')
  ;(parent as Record<string, unknown>)[last] = value
}

export function projectState(
  input: unknown,
  fields: Field[],
  resolve: ReferenceResolver,
  excludedPaths: string[] = [],
  strict = false,
  sourceOrigin?: string,
): SiteTransferState {
  const portableURL = (value: string) => {
    if (!sourceOrigin) return value
    try {
      const url = new URL(value)
      return url.origin === new URL(sourceOrigin).origin
        ? url.pathname + url.search + url.hash
        : value
    } catch {
      return value
    }
  }
  const references: SiteTransferReference[] = []
  const excluded = (path: Path) => excludedPaths.includes(path.join('.'))
  function reference(value: unknown, resource: string, path: Path): Json {
    const id = value && typeof value === 'object' ? object(value).id : value
    if (typeof id !== 'string' && typeof id !== 'number')
      throw new Error(`Invalid relationship at ${path.join('.')}`)
    references.push({ path, target: resolve(resource, id) })
    return null
  }
  function rich(value: unknown, path: Path, depth = 0): Json {
    if (depth > 100) throw new Error('Rich text exceeds nesting limit')
    if (Array.isArray(value))
      return value.map((v, index) => rich(v, [...path, index], depth + 1))
    if (!value || typeof value !== 'object') return json(value)
    const node = object(value)
    const result: Record<string, Json> = {}
    const allowed = new Set([
      'root',
      'children',
      'type',
      'version',
      'format',
      'indent',
      'direction',
      'mode',
      'style',
      'detail',
      'text',
      'tag',
      'listType',
      'start',
      'value',
      'fields',
      'relationTo',
    ])
    for (const [key, entry] of Object.entries(node)) {
      if (!allowed.has(key))
        throw new Error(`Unsupported rich text property ${key}`)
      if (
        key === 'value' &&
        (node.type === 'upload' || node.type === 'relationship')
      ) {
        if (typeof node.relationTo !== 'string')
          throw new Error('Invalid rich text upload')
        result[key] = reference(entry, node.relationTo, [...path, key])
      } else if (key === 'fields') {
        const link = object(entry)
        if (link.blockType)
          throw new Error(
            'Rich text blocks require an explicit transfer extension',
          )
        const linkData: Record<string, Json> = {}
        for (const [name, item] of Object.entries(link)) {
          if (!['url', 'newTab', 'linkType', 'doc', 'id'].includes(name))
            throw new Error(`Unsupported link property ${name}`)
          if (name === 'id') continue
          if (name === 'doc' && item) {
            const doc = object(item)
            if (typeof doc.relationTo !== 'string')
              throw new Error('Invalid rich text document link')
            linkData.doc = {
              relationTo: doc.relationTo,
              value: reference(doc.value, doc.relationTo, [
                ...path,
                key,
                'doc',
                'value',
              ]),
            }
          } else
            linkData[name] =
              name === 'url' && typeof item === 'string'
                ? portableURL(item)
                : json(item)
        }
        result[key] = linkData
      } else result[key] = rich(entry, [...path, key], depth + 1)
    }
    return result
  }
  function walk(
    data: Record<string, unknown>,
    list: Field[],
    base: Path,
  ): Record<string, Json> {
    const result: Record<string, Json> = {}
    list = list.flatMap(function flatten(field): Field[] {
      if (field.type === 'tabs')
        return field.tabs.flatMap((tab) =>
          'name' in tab && tab.name
            ? [{ type: 'group', name: tab.name, fields: tab.fields } as Field]
            : tab.fields.flatMap(flatten),
        )
      if (!('name' in field) && 'fields' in field)
        return field.fields.flatMap(flatten)
      return [field]
    })
    for (const field of list) {
      if (field.type === 'tabs') {
        for (const tab of field.tabs) {
          if ('name' in tab && tab.name) {
            const name = tab.name
            if (data[name] != null && !excluded([...base, name]))
              result[name] = walk(object(data[name]), tab.fields, [
                ...base,
                name,
              ])
          } else Object.assign(result, walk(data, tab.fields, base))
        }
      } else if (!('name' in field)) {
        if ('fields' in field)
          Object.assign(result, walk(data, field.fields, base))
      } else {
        const name = field.name
        if (metadata.has(name)) continue
        const value = data[name]
        const path = [...base, name]
        if (value === undefined || excluded(path)) continue
        if (value === null) {
          result[name] = null
          continue
        }
        if (field.type === 'relationship' || field.type === 'upload') {
          const one = (entry: unknown, p: Path): Json => {
            if (Array.isArray(field.relationTo)) {
              const relation = object(entry)
              if (
                typeof relation.relationTo !== 'string' ||
                !field.relationTo.includes(relation.relationTo)
              )
                throw new Error('Unsupported relationship collection')
              return {
                relationTo: relation.relationTo,
                value: reference(relation.value, relation.relationTo, [
                  ...p,
                  'value',
                ]),
              }
            }
            return reference(entry, field.relationTo, p)
          }
          result[name] = field.hasMany
            ? Array.isArray(value)
              ? value.map((v, i) => one(v, [...path, i]))
              : (() => {
                  throw new Error('Expected relationship array')
                })()
            : one(value, path)
        } else if (field.type === 'group')
          result[name] = walk(object(value), field.fields, path)
        else if (field.type === 'array') {
          if (!Array.isArray(value)) throw new Error('Expected array')
          result[name] = value.map((entry, i) =>
            walk(object(entry), field.fields, [...path, i]),
          )
        } else if (field.type === 'blocks') {
          if (!Array.isArray(value)) throw new Error('Expected blocks array')
          result[name] = value.map((entry, i) => {
            const block = object(entry)
            const config = field.blocks.find(
              (candidate) =>
                typeof candidate !== 'string' &&
                candidate.slug === block.blockType,
            )
            if (!config || typeof config === 'string')
              throw new Error(`Unsupported block ${String(block.blockType)}`)
            return {
              blockType: config.slug,
              ...walk(block, config.fields, [...path, i]),
            }
          })
        } else if (field.type === 'richText') result[name] = rich(value, path)
        else if (field.type === 'join' || field.type === 'ui') continue
        else {
          if (field.type === 'checkbox' && typeof value !== 'boolean')
            throw new Error(`Expected checkbox ${name}`)
          if (field.type === 'number' && typeof value !== 'number')
            throw new Error(`Expected number ${name}`)
          if (
            ['text', 'textarea', 'code', 'date', 'email'].includes(
              field.type,
            ) &&
            typeof value !== 'string'
          )
            throw new Error(`Expected text ${name}`)
          result[name] =
            name === 'url' &&
            typeof value === 'string' &&
            ['url', 'custom'].includes(String(data.type))
              ? portableURL(value)
              : json(value)
        }
      }
    }
    // Tabs/rows flatten field names; run strict checking once against a flattened definition.
    if (strict) {
      const names = (items: Field[]): string[] =>
        items.flatMap((f) =>
          f.type === 'tabs'
            ? f.tabs.flatMap((t) =>
                'name' in t && t.name ? [t.name] : names(t.fields),
              )
            : 'name' in f
              ? [f.name]
              : 'fields' in f
                ? names(f.fields)
                : [],
        )
      for (const key of Object.keys(data))
        if (
          !names(list).includes(key) &&
          !metadata.has(key) &&
          key !== 'blockType'
        )
          throw new Error(`Unsupported field ${[...base, key].join('.')}`)
    }
    return result
  }
  return { data: walk(object(input), fields, []), references }
}
