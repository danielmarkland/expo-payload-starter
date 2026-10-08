import { createClient } from '@supabase/supabase-js'
import {
  createProfileRepository,
  createPostgresProfileRepository,
  type Database,
} from '@starter/data'
import { authenticatedIdentity, betterAuthEnabled, identityDatabase } from '@/lib/identity/server'
import {
  ServiceUnavailableError,
  UnauthorizedError,
} from '@danielmarkland/publishing-core/serviceErrors'
export async function getAuthenticatedProfile(authorization: null | string) {
  const context = await authenticatedProductContext(authorization)
  return context.profiles.findById(context.userId)
}

export async function updateAuthenticatedProfile(
  authorization: null | string,
  displayName: null | string,
) {
  const context = await authenticatedProductContext(authorization)
  return context.profiles.updateDisplayName(context.userId, displayName)
}

async function authenticatedProductContext(authorization: null | string) {
  if (betterAuthEnabled()) {
    const session = await authenticatedIdentity(new Headers(authorization ? { authorization } : {}))
    return {
      profiles: createPostgresProfileRepository(identityDatabase(), session.user.id),
      userId: session.user.id,
    }
  }
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) throw new UnauthorizedError()
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new ServiceUnavailableError('Product data is not configured.')
  const client = createClient<Database, 'app'>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'app' },
    global: { headers: { authorization: `Bearer ${token}` } },
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) throw new UnauthorizedError()
  return {
    profiles: createProfileRepository(client),
    userId: data.user.id,
  }
}
