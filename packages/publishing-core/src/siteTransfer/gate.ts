import { createHash, randomUUID } from 'node:crypto'
import type {
  CollectionBeforeOperationHook,
  Payload,
  PayloadRequest,
  Plugin,
} from 'payload'

const gateSlug = 'publishing-transfer-gates'
const internal = Symbol('publishing-transfer-lock')
export type GateRequest = Partial<PayloadRequest>
const gateKey = (scope: string) =>
  createHash('sha256').update(scope).digest('hex')
async function acquireRow(payload: Payload, scope: string, req: GateRequest) {
  const key = gateKey(scope)
  const found = await payload.find({
    collection: gateSlug,
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  })
  const row =
    found.docs[0] ||
    (await payload.create({
      collection: gateSlug,
      data: { key, nonce: randomUUID() },
      req,
      overrideAccess: true,
    }))
  await payload.update({
    collection: gateSlug,
    id: row.id,
    data: { nonce: randomUUID() },
    req,
    overrideAccess: true,
  })
}
/** Serialize editorial writes with exports/replacements using a database row lock.
 * Scope resolution must include every affected site for bulk operations.
 * Scope must come from trusted records, never just a client-selected value.
 */
export function siteTransferGatePlugin(options: {
  enabled?: boolean
  collections: string[]
  globals?: string[]
  scopes: (
    args: Parameters<CollectionBeforeOperationHook>[0],
  ) => Promise<string[]>
}): Plugin {
  return (config) => {
    config.collections ||= []
    config.collections.push({
      slug: gateSlug,
      dbName: 'cms_publishing_transfer_gates',
      lockDocuments: false,
      admin: { hidden: true },
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
        delete: () => false,
      },
      fields: [
        { name: 'key', type: 'text', required: true, unique: true },
        { name: 'nonce', type: 'text', required: true },
        { name: 'lastReplacement', type: 'text' },
        { name: 'backupKey', type: 'text' },
      ],
    })
    const hook: CollectionBeforeOperationHook = async (args) => {
      if (
        options.enabled === false ||
        !['create', 'update', 'delete', 'restoreVersion'].includes(
          args.operation,
        ) ||
        args.req.context[internal as unknown as string]
      )
        return args.args
      if (!args.req.transactionID)
        throw new Error(
          'Editorial writes require transactions for site transfer locking',
        )
      const scopes = [...new Set(await options.scopes(args))].sort()
      if (!scopes.length)
        throw new Error('Cannot resolve editorial write scope')
      const req = {
        ...args.req,
        context: { ...args.req.context, [internal]: true },
      }
      for (const scope of scopes) await acquireRow(args.req.payload, scope, req)
      return args.args
    }
    for (const collection of config.collections)
      if (options.collections.includes(collection.slug)) {
        collection.hooks ||= {}
        collection.hooks.beforeOperation = [
          hook,
          ...(collection.hooks.beforeOperation || []),
        ]
      }
    for (const global of config.globals || [])
      if (options.globals?.includes(global.slug)) {
        global.hooks ||= {}
        global.hooks.beforeChange = [
          async ({ req, data }) => {
            if (
              options.enabled === false ||
              req.context[internal as unknown as string]
            )
              return data
            if (!req.transactionID)
              throw new Error('Editorial writes require transactions')
            await acquireRow(req.payload, 'site', {
              ...req,
              context: { ...req.context, [internal]: true },
            })
            return data
          },
          ...(global.hooks.beforeChange || []),
        ]
      }
    return config
  }
}
/** The supplied request is mutated while locked so all Local API work uses its transaction. */
export function payloadSiteWriteLock(
  payload: Payload,
  scope: string,
  req: GateRequest,
) {
  return async <T>(work: () => Promise<T>): Promise<T> => {
    if (req.transactionID) throw new Error('Nested site transfer lock')
    const transactionID = await payload.db.beginTransaction()
    if (transactionID == null)
      throw new Error('Site transfer requires a transactional database')
    req.transactionID = transactionID
    req.context = { ...req.context, [internal]: true }
    try {
      await acquireRow(payload, scope, req)
      const result = await work()
      await payload.db.commitTransaction(transactionID)
      return result
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID)
      throw error
    } finally {
      delete req.transactionID
      delete req.context[internal as unknown as string]
    }
  }
}

/** Records a replacement receipt in the same Payload transaction as its content. */
export function payloadReplacementReceipt(
  payload: Payload,
  scope: string,
  operationID: string,
) {
  return {
    async read(req: GateRequest): Promise<string | undefined> {
      const row = (
        await payload.find({
          collection: gateSlug,
          where: { key: { equals: gateKey(scope) } },
          limit: 1,
          depth: 0,
          req,
          overrideAccess: true,
        })
      ).docs[0]
      return row?.lastReplacement === operationID
        ? String(row.backupKey)
        : undefined
    },
    async record(req: GateRequest, backup: string): Promise<void> {
      const row = (
        await payload.find({
          collection: gateSlug,
          where: { key: { equals: gateKey(scope) } },
          limit: 1,
          depth: 0,
          req,
          overrideAccess: true,
        })
      ).docs[0]
      if (!row) throw new Error('Missing replacement gate')
      await payload.update({
        collection: gateSlug,
        id: row.id,
        data: { lastReplacement: operationID, backupKey: backup },
        req,
        overrideAccess: true,
      })
    },
  }
}
