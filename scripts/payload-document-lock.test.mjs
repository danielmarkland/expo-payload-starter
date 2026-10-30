import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import test from 'node:test'

const require = createRequire(
  new URL('../apps/site/package.json', import.meta.url),
)
const { checkDocumentLockStatus } = await import(
  pathToFileURL(
    join(
      dirname(require.resolve('payload')),
      'utilities/checkDocumentLockStatus.js',
    ),
  )
)

function request(lock) {
  const req = {
    transactionID: 'save-transaction',
    user: { id: 1 },
    payload: {
      collections: {
        'payload-locked-documents': {},
        'site-settings': { config: {} },
      },
      db: {
        name: 'postgres',
        async find(args) {
          // Model a pool whose connections are already held by save transactions.
          // A query outside the request transaction cannot acquire a connection.
          assert.equal(
            args.req,
            req,
            'Lock reads must reuse the save transaction',
          )
          return { docs: lock ? [lock] : [] }
        },
        async deleteMany(args) {
          assert.equal(args.req, req)
          req.deleted = true
        },
      },
    },
  }
  return req
}

test('concurrent saves check locks without acquiring extra pool connections', async () => {
  const requests = [request(), request()]
  await Promise.all(
    requests.map((req) =>
      checkDocumentLockStatus({
        id: 2,
        collectionSlug: 'site-settings',
        overrideLock: false,
        req,
      }),
    ),
  )
  assert.ok(requests.every((req) => req.deleted))
})

test("another editor's active lock still prevents saving", async () => {
  const req = request({
    updatedAt: new Date().toISOString(),
    user: { value: 2 },
  })
  await assert.rejects(
    checkDocumentLockStatus({
      id: 2,
      collectionSlug: 'site-settings',
      overrideLock: false,
      req,
    }),
    (error) => error.status === 423,
  )
  assert.equal(req.deleted, undefined)
})

test("the current editor's lock permits saving", async () => {
  const req = request({
    updatedAt: new Date().toISOString(),
    user: { value: 1 },
  })
  await checkDocumentLockStatus({
    id: 2,
    collectionSlug: 'site-settings',
    overrideLock: false,
    req,
  })
  assert.equal(req.deleted, true)
})
