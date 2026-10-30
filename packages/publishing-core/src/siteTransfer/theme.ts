import type { SiteTransferOptions, TransferPreview } from './payload.js'
import {
  capture,
  fingerprint,
  materialize,
  request,
  writeRequest,
  validateSiteArchive,
} from './payload.js'
import { encodeSiteArchive, sha256 } from './archive.js'
import { selectTransferFields } from './definitions.js'
import { prepareWriteData } from './fields.js'

// A theme contains visual preferences only. Identity, navigation, content,
// media, SEO, archive content and host integrations are never part of it.
function themeOptions(options: SiteTransferOptions): SiteTransferOptions {
  const settings = options.resources.find(
    (resource) => resource.key === 'site-settings',
  )
  if (!settings) throw new Error('Site Settings is required for theme transfer')
  const fields = selectTransferFields(settings.fields, ['theme', 'buttons'])
  if (!fields.length) throw new Error('Theme fields are unavailable')
  return {
    ...options,
    resources: [
      { ...settings, fields, excludedPaths: undefined, drafts: false },
    ],
    extensions: { theme: 1 },
  }
}
function readTheme(bytes: Buffer, options: SiteTransferOptions) {
  const scoped = themeOptions(options)
  const site = validateSiteArchive(bytes, scoped)
  if (
    site.manifest.records.length !== 1 ||
    site.manifest.assets.length ||
    site.manifest.records[0]!.current.references.length ||
    site.manifest.records[0]!.published
  )
    throw new Error(
      'A theme must contain one visual-settings document without content or media',
    )
  return { scoped, site }
}
export async function exportTheme(
  options: SiteTransferOptions,
): Promise<Buffer> {
  return options.withWriteLock(async () => {
    const bytes = encodeSiteArchive(await capture(themeOptions(options)))
    readTheme(bytes, options)
    return bytes
  })
}
export async function previewThemeImport(
  bytes: Buffer,
  options: SiteTransferOptions,
): Promise<TransferPreview> {
  readTheme(bytes, options)
  return options.withWriteLock(async () => ({
    digest: sha256(bytes),
    destinationDigest: fingerprint(await capture(options)),
    incoming: { theme: 1 },
    removed: { theme: 1 },
    mediaBytes: 0,
  }))
}
/** Update only visual settings. Preserve the destination document, content IDs,
 * versions, branding, navigation, media and all host configuration. */
export async function importTheme(
  bytes: Buffer,
  expected: TransferPreview,
  options: SiteTransferOptions,
): Promise<{ backup: string }> {
  const { scoped, site } = readTheme(bytes, options)
  if (sha256(bytes) !== expected.digest)
    throw new Error('Theme changed after preview')
  const result = await options.withWriteLock(async () => {
    const req = await request(options)
    const receipt = await options.completion?.read(req)
    if (receipt) return { backup: receipt }
    const destination = await capture(options)
    if (fingerprint(destination) !== expected.destinationDigest)
      throw new Error('Destination changed; create a new preview')
    const backupBytes = encodeSiteArchive(destination)
    validateSiteArchive(backupBytes, options)
    const backup = await options.saveBackup(backupBytes)
    await options.beforeReplace?.()
    const { payload } = options
    const ownsTransaction = !req.transactionID
    const transactionID = req.transactionID
      ? await req.transactionID
      : await payload.db.beginTransaction()
    if (transactionID == null)
      throw new Error('Atomic theme import requires transactions')
    req.transactionID = transactionID
    try {
      const resource = scoped.resources[0]!
      const record = site.manifest.records[0]!
      const data = {
        ...prepareWriteData(
          materialize(record.current, new Map()),
          resource.fields,
        ),
        ...resource.scope,
      }
      if (resource.kind === 'global') {
        await payload.updateGlobal({
          slug: resource.slug,
          data,
          overrideAccess: true,
          req: writeRequest(req),
        })
      } else {
        const found = await payload.find({
          collection: resource.slug,
          where: resource.where,
          limit: 2,
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (found.docs.length !== 1)
          throw new Error('Expected one destination Site Settings document')
        await payload.update({
          collection: resource.slug,
          id: found.docs[0]!.id,
          data,
          overrideAccess: true,
          req: writeRequest(req),
        })
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
