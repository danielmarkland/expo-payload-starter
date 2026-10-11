import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { identityServer, identityDatabase } from '../../src/lib/identity/server.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test-password-32-characters',
  role: 'admin' as const,
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  await identityDatabase().query(
    "delete from identity.records where realm='platform' and model='user' and data->>'email'=$1",
    [testUser.email],
  )
  const auth = await identityServer('editor')
  const context = await auth.$context
  const user = await context.internalAdapter.createUser(
    { name: 'Test editor', email: testUser.email, emailVerified: true },
    { method: 'admin' },
  )
  await context.internalAdapter.createAccount({
    userId: user.id,
    providerId: 'credential',
    accountId: user.id,
    password: await context.password.hash(testUser.password),
  })
  // Create fresh linked CMS user.
  await payload.create({
    collection: 'users',
    data: { email: testUser.email, role: testUser.role, authIdentityId: user.id },
    draft: false,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  await identityDatabase().query(
    "delete from identity.records where realm='platform' and model='user' and data->>'email'=$1",
    [testUser.email],
  )
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
