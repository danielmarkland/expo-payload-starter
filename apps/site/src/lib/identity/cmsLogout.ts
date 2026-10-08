import type { CollectionAfterLogoutHook } from 'payload'
import { betterAuthEnabled, identityServer } from './server'

export const logoutEditorIdentity: CollectionAfterLogoutHook = async ({ req }) => {
  if (!betterAuthEnabled()) return
  const auth = await identityServer('editor')
  if (req.searchParams?.get('allSessions') === 'true')
    await auth.api.revokeSessions({ headers: req.headers })
  const result = await auth.api.signOut({ headers: req.headers, returnHeaders: true })
  req.responseHeaders ??= new Headers()
  for (const cookie of result.headers.getSetCookie())
    req.responseHeaders.append('Set-Cookie', cookie)
}
