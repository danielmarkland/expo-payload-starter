// @vitest-environment node
import { beforeAll, expect, it, describe } from 'vitest'
import { getPayload, registerFirstUserOperation, createLocalReq, type Payload } from 'payload'
import config from '@/payload.config'
let payload: Payload
beforeAll(async () => {
  payload = await getPayload({ config })
})
describe('standalone CMS administration', () => {
  it('bootstraps a usable first administrator through Payload native registration', async () => {
    const existing = await payload.count({ collection: 'users', overrideAccess: true })
    const req = await createLocalReq({}, payload)
    const data = {
      email: `bootstrap-${crypto.randomUUID()}@example.com`,
      password: crypto.randomUUID(),
      role: 'editor' as const,
    }
    if (existing.totalDocs) {
      await expect(
        registerFirstUserOperation({ collection: payload.collections.users, data, req }),
      ).rejects.toThrow()
      return
    }
    const result = await registerFirstUserOperation({
      collection: payload.collections.users,
      data,
      req,
    })
    const firstUser = result.user
    if (!firstUser) throw new Error('First-user registration did not return a user.')
    try {
      expect(firstUser.role).toBe('admin')
      const admin = await payload.findByID({
        collection: 'users',
        id: firstUser.id,
        overrideAccess: true,
      })
      expect(admin.role).toBe('admin')
      expect(result.token).toBeTruthy()
    } finally {
      await payload.delete({ collection: 'users', id: firstUser.id, overrideAccess: true })
    }
  })
  it('rejects anonymous/editor account creation and protects role changes', async () => {
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: `admin-${crypto.randomUUID()}@example.com`,
        password: crypto.randomUUID(),
        role: 'admin',
      },
      overrideAccess: true,
    })
    let editorId: number | undefined
    try {
      const adminUser = { ...admin, collection: 'users' as const }
      const editor = await payload.create({
        collection: 'users',
        data: {
          email: `editor-${crypto.randomUUID()}@example.com`,
          password: crypto.randomUUID(),
          role: 'editor',
        },
        user: adminUser,
        overrideAccess: false,
      })
      editorId = editor.id
      const editorUser = { ...editor, collection: 'users' as const }
      for (const user of [undefined, editorUser]) {
        await expect(
          payload.create({
            collection: 'users',
            data: {
              email: `denied-${crypto.randomUUID()}@example.com`,
              password: crypto.randomUUID(),
              role: 'admin',
            },
            user,
            overrideAccess: false,
          }),
        ).rejects.toThrow()
      }
      await payload.update({
        collection: 'users',
        id: editor.id,
        data: { role: 'admin' },
        user: editorUser,
        overrideAccess: false,
      })
      expect(
        (await payload.findByID({ collection: 'users', id: editor.id, overrideAccess: true })).role,
      ).toBe('editor')
      await payload.update({
        collection: 'users',
        id: editor.id,
        data: { role: 'admin' },
        user: adminUser,
        overrideAccess: false,
      })
      expect(
        (await payload.findByID({ collection: 'users', id: editor.id, overrideAccess: true })).role,
      ).toBe('admin')
    } finally {
      if (editorId)
        await payload.delete({ collection: 'users', id: editorId, overrideAccess: true })
      await payload.delete({ collection: 'users', id: admin.id, overrideAccess: true })
    }
  })
})
