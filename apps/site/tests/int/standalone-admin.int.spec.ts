// @vitest-environment node
import { beforeAll, expect, it, describe } from 'vitest'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
let payload: Payload
beforeAll(async () => {
  payload = await getPayload({ config })
})
describe('standalone CMS administration', () => {
  it('keeps anonymous CMS account creation disabled with native editorial login', async () => {
    expect(payload.collections.users.config.auth).toMatchObject({ disableLocalStrategy: true })
    await expect(
      payload.create({
        collection: 'users',
        data: { email: `bootstrap-${crypto.randomUUID()}@example.com`, role: 'admin' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
  it('rejects anonymous/editor account creation and protects role changes', async () => {
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: `admin-${crypto.randomUUID()}@example.com`,
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
