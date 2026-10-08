// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import type { PayloadRequest, SanitizedCollectionConfig } from 'payload'
const state = vi.hoisted(() => ({
  enabled: false,
  signOut: vi.fn(),
  revokeSessions: vi.fn(),
  identityServer: vi.fn(),
}))
vi.mock('@/lib/identity/server', () => ({
  betterAuthEnabled: () => state.enabled,
  identityServer: state.identityServer,
}))
import { Users } from '@/collections/Users'
beforeEach(() => {
  vi.clearAllMocks()
  state.enabled = true
  state.identityServer.mockResolvedValue({
    api: { signOut: state.signOut, revokeSessions: state.revokeSessions },
  })
  const headers = new Headers()
  headers.append('Set-Cookie', 'editor.session=; Max-Age=0; Path=/; HttpOnly')
  state.signOut.mockResolvedValue({ headers })
})
const invoke = async (allSessions = false) => {
  const req = {
    headers: new Headers({ cookie: 'editor.session=caller' }),
    searchParams: new URLSearchParams({ allSessions: String(allSessions) }),
  } as PayloadRequest
  await Users.hooks!.afterLogout![0]({
    req,
    context: {},
    collection: {} as SanitizedCollectionConfig,
  })
  return req
}
it('revokes the editorial session and propagates cookie expiration on CMS logout', async () => {
  const req = await invoke()
  expect(state.identityServer).toHaveBeenCalledWith('editor')
  expect(state.signOut).toHaveBeenCalledExactlyOnceWith({
    headers: req.headers,
    returnHeaders: true,
  })
  expect(req.responseHeaders?.getSetCookie()).toEqual([
    'editor.session=; Max-Age=0; Path=/; HttpOnly',
  ])
  expect(state.revokeSessions).not.toHaveBeenCalled()
})
it('revokes all editorial sessions when requested without involving product identity', async () => {
  const req = await invoke(true)
  expect(state.revokeSessions).toHaveBeenCalledExactlyOnceWith({ headers: req.headers })
  expect(state.revokeSessions.mock.invocationCallOrder[0]).toBeLessThan(
    state.signOut.mock.invocationCallOrder[0],
  )
})
it('retains the legacy CMS logout flow until native activation', async () => {
  state.enabled = false
  const req = await invoke(true)
  expect(state.identityServer).not.toHaveBeenCalled()
  expect(req.responseHeaders).toBeUndefined()
})
