import { extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Field, Payload, PayloadRequest, Where } from 'payload'
import {
  siteTransferManifestSchema,
  type SiteTransferManifest,
  type SiteTransferRecord,
  type SiteTransferState,
} from '@danielmarkland/publishing-contracts/siteTransfer'
import {
  encodeSiteArchive,
  decodeSiteArchive,
  sha256,
  type SiteArchive,
} from './archive.js'
import { object, projectState, setPath } from './fields.js'

export interface TransferResource {
  key: string
  slug: string
  kind: 'collection' | 'global'
  fields: Field[]
  drafts?: boolean
  media?: boolean
  where?: Where
  // Inject trusted destination scope after projection; never accept it from an archive.
  scope?: Record<string, unknown>
  excludedPaths?: string[]
}
export interface SiteTransferOptions {
  payload: Payload
  resources: TransferResource[]
  extensions?: Record<string, 1>
  req?: Partial<PayloadRequest>
  sourceOrigin?: string
  readMedia: (document: Record<string, unknown>) => Promise<Buffer>
  // The host must enforce this lock on ALL editorial writes, including Local API.
  withWriteLock: <T>(work: () => Promise<T>) => Promise<T>
  saveBackup: (archive: Buffer) => Promise<string>
  // Original bytes must be retained. Deletion hooks must not remove backup assets.
  beforeReplace?: () => Promise<void>
  completion?: {
    read: (req: Partial<PayloadRequest>) => Promise<string | undefined>
    record: (req: Partial<PayloadRequest>, backup: string) => Promise<void>
  }
  afterCommit?: () => Promise<void>
}
export interface TransferPreview {
  digest: string
  destinationDigest: string
  incoming: Record<string, number>
  removed: Record<string, number>
  mediaBytes: number
}
const drafts = (resource: TransferResource) => Boolean(resource.drafts)
const count = (manifest: SiteTransferManifest) =>
  Object.fromEntries(
    manifest.resources.map((key) => [
      key,
      manifest.records.filter((record) => record.resource === key).length,
    ]),
  )
function assertResources(options: Pick<SiteTransferOptions, 'resources'>) {
  if (
    !options.resources.length ||
    new Set(options.resources.map((r) => r.key)).size !==
      options.resources.length
  )
    throw new Error('Resource keys must be unique')
  if (options.resources.some((r) => r.media && r.kind !== 'collection'))
    throw new Error('Media must be a collection')
}
async function request(
  options: SiteTransferOptions,
): Promise<Partial<PayloadRequest>> {
  return {
    ...options.req,
    payload: options.payload,
    context: {
      ...options.req?.context,
      siteTransfer: true,
      suppressIntegrationSideEffects: true,
    },
  }
}
async function capture(options: SiteTransferOptions): Promise<SiteArchive> {
  assertResources(options)
  const { payload } = options
  const req = await request(options)
  const captured: {
    resource: TransferResource
    current: Record<string, unknown>
    published?: Record<string, unknown>
    key: string
  }[] = []
  for (const resource of options.resources) {
    if (resource.kind === 'global') {
      const doc = await payload.findGlobal({
        slug: resource.slug,
        depth: 0,
        overrideAccess: true,
        req,
      })
      captured.push({ resource, current: object(doc), key: resource.key })
    } else {
      const current = await payload.find({
        collection: resource.slug,
        pagination: false,
        depth: 0,
        draft: drafts(resource),
        sort: 'id',
        where: resource.where,
        overrideAccess: true,
        req,
      })
      const published = drafts(resource)
        ? await payload.find({
            collection: resource.slug,
            pagination: false,
            depth: 0,
            draft: false,
            where: {
              and: [resource.where || {}, { _status: { equals: 'published' } }],
            },
            overrideAccess: true,
            req,
          })
        : null
      for (const doc of current.docs)
        captured.push({
          resource,
          current: object(doc),
          published: published?.docs.find(
            (p) => String(p.id) === String(doc.id),
          ),
          key: `record:${captured.length}`,
        })
    }
  }
  const identities = new Map(
    captured.map((r) => [`${r.resource.slug}:${r.current.id}`, r.key]),
  )
  const resolve = (slug: string, id: string | number) => {
    const key = identities.get(`${slug}:${id}`)
    if (!key)
      throw new Error(`Relationship outside export scope: ${slug}:${id}`)
    return key
  }
  const assets = new Map<string, Buffer>()
  const manifestAssets: SiteTransferManifest['assets'] = []
  const records: SiteTransferRecord[] = []
  for (const item of captured) {
    const project = (doc: Record<string, unknown>) =>
      projectState(
        doc,
        item.resource.fields,
        resolve,
        item.resource.excludedPaths,
        false,
        options.sourceOrigin,
      )
    const record: SiteTransferRecord = {
      key: item.key,
      resource: item.resource.key,
      draft: item.resource.drafts ? item.current._status === 'draft' : false,
      current: project(item.current),
    }
    if (item.published) record.published = project(item.published)
    if (item.resource.media) {
      const data = await options.readMedia(item.current)
      const hash = sha256(data)
      const path = `assets/${hash}`
      assets.set(path, data)
      record.asset = item.key
      manifestAssets.push({
        key: item.key,
        path,
        sha256: hash,
        size: data.length,
        filename: String(item.current.filename),
        mimeType: String(item.current.mimeType),
      })
    }
    records.push(record)
  }
  return {
    manifest: siteTransferManifestSchema.parse({
      format: 'publishing-site',
      version: 1,
      createdAt: new Date().toISOString(),
      resources: options.resources.map((r) => r.key),
      extensions: options.extensions || {},
      records,
      assets: manifestAssets,
    }),
    assets,
  }
}
function fingerprint(site: SiteArchive) {
  // Exclude capture time; serialization and record enumeration are deterministic.
  return sha256(
    Buffer.from(JSON.stringify({ ...site.manifest, createdAt: '' })),
  )
}
function materialize(
  state: SiteTransferState,
  identities: Map<string, string | number>,
  allowMissing = false,
): Record<string, unknown> {
  const result = structuredClone(state.data)
  for (const ref of state.references) {
    const id = identities.get(ref.target)
    if (id === undefined && !allowMissing)
      throw new Error(`Unresolved reference ${ref.target}`)
    setPath(result, ref.path, id ?? null)
  }
  return result
}
export function validateSiteArchive(
  bytes: Buffer,
  options: Pick<SiteTransferOptions, 'resources' | 'extensions'>,
): SiteArchive {
  assertResources(options)
  const site = decodeSiteArchive(bytes)
  const manifest = site.manifest
  if (
    JSON.stringify([...manifest.resources].sort()) !==
    JSON.stringify(options.resources.map((r) => r.key).sort())
  )
    throw new Error('Site resource coverage does not match destination')
  if (
    JSON.stringify(Object.entries(manifest.extensions).sort()) !==
    JSON.stringify(Object.entries(options.extensions || {}).sort())
  )
    throw new Error('Unsupported site extensions')
  const byKey = new Map<string, SiteTransferRecord>()
  for (const record of manifest.records) {
    if (byKey.has(record.key)) throw new Error(`Duplicate record ${record.key}`)
    byKey.set(record.key, record)
  }
  const assets = new Map(manifest.assets.map((asset) => [asset.key, asset]))
  const usedAssets = new Set<string>()
  for (const resource of options.resources) {
    const records = manifest.records.filter(
      (record) => record.resource === resource.key,
    )
    if (resource.kind === 'global' && records.length !== 1)
      throw new Error(`Expected singleton ${resource.key}`)
    for (const record of records) {
      if (Boolean(record.asset) !== Boolean(resource.media))
        throw new Error(`Invalid media record ${record.key}`)
      if (record.asset) {
        if (!assets.has(record.asset) || usedAssets.has(record.asset))
          throw new Error('Invalid asset reference')
        usedAssets.add(record.asset)
      }
      if ((record.published || record.draft) && !resource.drafts)
        throw new Error('Published state on non-versioned resource')
      if (
        resource.drafts &&
        !record.draft &&
        (!record.published ||
          JSON.stringify(record.current) !== JSON.stringify(record.published))
      )
        throw new Error(
          'Published record must have matching current and published states',
        )
      for (const state of [record.current, record.published].filter(
        (s): s is SiteTransferState => Boolean(s),
      )) {
        const fake = new Map([...byKey.keys()].map((key) => [key, key]))
        const data = materialize(state, fake)
        const projected = projectState(
          data,
          resource.fields,
          (slug, key) => {
            const target = byKey.get(String(key))
            const targetResource = options.resources.find(
              (r) => r.key === target?.resource,
            )
            if (
              !targetResource ||
              targetResource.slug !== slug ||
              targetResource.kind !== 'collection'
            )
              throw new Error('Relationship target does not match field')
            return String(key)
          },
          resource.excludedPaths,
          true,
        )
        if (JSON.stringify(projected) !== JSON.stringify(state))
          throw new Error('Noncanonical state or invalid relationship paths')
      }
    }
  }
  if (
    manifest.records.some((r) => !manifest.resources.includes(r.resource)) ||
    usedAssets.size !== assets.size
  )
    throw new Error('Unlisted resources or unused assets')
  return site
}
export async function exportSite(
  options: SiteTransferOptions,
): Promise<Buffer> {
  return options.withWriteLock(async () =>
    encodeSiteArchive(await capture(options)),
  )
}
export async function previewSiteReplacement(
  bytes: Buffer,
  options: SiteTransferOptions,
): Promise<TransferPreview> {
  const site = validateSiteArchive(bytes, options)
  return options.withWriteLock(async () => {
    const destination = await capture(options)
    return {
      digest: sha256(bytes),
      destinationDigest: fingerprint(destination),
      incoming: count(site.manifest),
      removed: count(destination.manifest),
      mediaBytes: site.manifest.assets.reduce((sum, a) => sum + a.size, 0),
    }
  })
}
export async function replaceSite(
  bytes: Buffer,
  expected: TransferPreview,
  options: SiteTransferOptions,
): Promise<{ backup: string }> {
  const site = validateSiteArchive(bytes, options)
  if (sha256(bytes) !== expected.digest)
    throw new Error('Archive changed after preview')
  const result = await options.withWriteLock(async () => {
    const receipt = await options.completion?.read(await request(options))
    if (receipt) return { backup: receipt }
    const destination = await capture(options)
    if (fingerprint(destination) !== expected.destinationDigest)
      throw new Error('Destination changed; create a new preview')
    const backupBytes = encodeSiteArchive(destination)
    validateSiteArchive(backupBytes, options)
    const backup = await options.saveBackup(backupBytes)
    await options.beforeReplace?.()
    const { payload } = options
    const req = await request(options)
    const ownsTransaction = !req.transactionID
    const transactionID = req.transactionID
      ? await req.transactionID
      : await payload.db.beginTransaction()
    if (transactionID === null || transactionID === undefined)
      throw new Error('Atomic replacement requires transactions')
    req.transactionID = transactionID
    try {
      const identities = new Map<string, string | number>()
      const preserved = new Map<string, Record<string, unknown>>()
      for (const resource of options.resources) {
        if (resource.excludedPaths?.length) {
          const existing =
            resource.kind === 'global'
              ? await payload.findGlobal({ slug: resource.slug, depth: 0, req })
              : (
                  await payload.find({
                    collection: resource.slug,
                    pagination: false,
                    where: resource.where,
                    depth: 0,
                    req,
                  })
                ).docs[0]
          if (existing) preserved.set(resource.key, object(existing))
        }
        if (resource.kind === 'collection') {
          if (resource.media) {
            // Payload's native delete removes bytes outside the transaction. Its database
            // adapter deletes rows only, preserving originals for rollback and backups.
            if (payload.collections[resource.slug]?.config.versions)
              throw new Error('Versioned media is unsupported')
            await payload.db.deleteMany({
              collection: resource.slug,
              where: resource.where || {},
              req,
            })
          } else {
            const old = await payload.find({
              collection: resource.slug,
              where: resource.where,
              pagination: false,
              depth: 0,
              req,
            })
            for (const document of old.docs)
              await payload.delete({
                collection: resource.slug,
                id: document.id,
                req,
                overrideAccess: true,
              })
          }
        }
      }
      for (const resource of options.resources.filter(
        (r) => r.kind === 'collection',
      )) {
        for (const record of site.manifest.records.filter(
          (r) => r.resource === resource.key,
        )) {
          // Create unpublished shells first so cyclic optional references can resolve.
          const data: Record<string, unknown> = {
            ...materialize(record.current, identities, true),
            ...resource.scope,
          }
          const original = preserved.get(resource.key)
          for (const path of resource.excludedPaths || []) {
            const parts = path.split('.')
            let source: unknown = original
            for (const part of parts)
              source =
                source && typeof source === 'object'
                  ? object(source)[part]
                  : undefined
            if (source !== undefined) {
              let target = data
              for (const part of parts.slice(0, -1)) {
                target[part] ||= {}
                target = object(target[part])
              }
              target[parts.at(-1)!] = source
            }
          }
          const asset = site.manifest.assets.find((a) => a.key === record.asset)
          const doc = await payload.create({
            collection: resource.slug,
            data,
            draft: drafts(resource),
            overrideAccess: true,
            req,
            ...(asset
              ? {
                  file: {
                    data: site.assets.get(asset.path)!,
                    name: `${randomUUID()}${extname(asset.filename).slice(0, 20)}`,
                    mimetype: asset.mimeType,
                    size: asset.size,
                  },
                }
              : {}),
          })
          identities.set(record.key, doc.id)
        }
      }
      for (const resource of options.resources) {
        for (const record of site.manifest.records.filter(
          (r) => r.resource === resource.key,
        )) {
          req.context!.syncedDocsSet = new Set()
          const apply = async (state: SiteTransferState, draft: boolean) => {
            const data = {
              ...materialize(state, identities),
              ...resource.scope,
            }
            const original = preserved.get(resource.key)
            for (const path of resource.excludedPaths || []) {
              const parts = path.split('.')
              let source: unknown = original
              for (const part of parts)
                source =
                  source && typeof source === 'object'
                    ? object(source)[part]
                    : undefined
              if (source !== undefined) {
                let target = data
                for (const part of parts.slice(0, -1)) {
                  target[part] ||= {}
                  target = object(target[part])
                }
                target[parts.at(-1)!] = source
              }
            }
            if (resource.kind === 'global')
              await payload.updateGlobal({
                slug: resource.slug,
                data,
                overrideAccess: true,
                req,
              })
            else
              await payload.update({
                collection: resource.slug,
                id: identities.get(record.key)!,
                data: {
                  ...data,
                  ...(resource.drafts
                    ? { _status: draft ? 'draft' : 'published' }
                    : {}),
                },
                draft,
                overrideAccess: true,
                req,
              })
          }
          if (record.published) await apply(record.published, false)
          if (!record.published || record.draft)
            await apply(record.current, record.draft)
        }
      }
      await options.completion?.record(req, backup)
      if (ownsTransaction) {
        await payload.db.commitTransaction(transactionID)
        delete req.transactionID
      }
    } catch (error) {
      if (ownsTransaction) await payload.db.rollbackTransaction(transactionID)
      throw error
    }
    return { backup }
  })
  await options.afterCommit?.()
  return result
}
