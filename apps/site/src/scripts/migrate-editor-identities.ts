import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { identityServer, identityDatabase } from '@/lib/identity/server'
// Operator-only reconciliation. No HTTP endpoint and no automatic email-to-role grants.
const payload = await getPayload({ config }),
  auth = await identityServer('editor'),
  context = await auth.$context
const users = await payload.find({
  collection: 'users',
  limit: 1000,
  depth: 0,
  overrideAccess: true,
})
if (users.totalDocs > 1000) throw Error('Reconcile staff in reviewed batches before cutover')
let linked = 0
for (const user of users.docs) {
  if (user.authIdentityId) continue
  const existing = await identityDatabase().query(
    "select id from identity.records where realm='platform' and model='user' and lower(data->>'email')=lower($1)",
    [user.email],
  )
  if (existing.rows.length)
    throw Error(
      'An existing editorial identity needs explicit operator reconciliation; no role was granted by email matching',
    )
  const identity = await context.internalAdapter.createUser(
    { id: randomUUID(), name: user.email, email: user.email, emailVerified: true },
    { method: 'admin' },
  )
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { authIdentityId: identity.id },
    overrideAccess: true,
  })
  await auth.api.requestPasswordReset({ body: { email: user.email, redirectTo: '/admin/login' } })
  linked++
}
console.log(JSON.stringify({ linked }))
await payload.destroy()
await identityDatabase().end()
