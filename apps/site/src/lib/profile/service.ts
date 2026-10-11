import { createPostgresProfileRepository } from '@starter/data'
import { authenticatedIdentity, identityDatabase } from '@/lib/identity/server'
export async function getAuthenticatedProfile(authorization: null | string) {
  const session = await authenticatedIdentity(new Headers(authorization ? { authorization } : {}))
  return createPostgresProfileRepository(identityDatabase(), session.user.id).findById(
    session.user.id,
  )
}
export async function updateAuthenticatedProfile(
  authorization: null | string,
  displayName: null | string,
) {
  const session = await authenticatedIdentity(new Headers(authorization ? { authorization } : {}))
  return createPostgresProfileRepository(identityDatabase(), session.user.id).updateDisplayName(
    session.user.id,
    displayName,
  )
}
