import type { AuthStrategy } from 'payload'
import { authenticatedIdentity, betterAuthEnabled } from './server'
import { UnauthorizedError } from '@danielmarkland/publishing-core/serviceErrors'
export const editorIdentityStrategy: AuthStrategy = {
  name: 'editor-identity',
  async authenticate({ headers, payload }) {
    if (!betterAuthEnabled()) return { user: null }
    let session
    try {
      session = await authenticatedIdentity(headers, 'editor')
    } catch (error) {
      if (error instanceof UnauthorizedError) return { user: null }
      throw error
    }
    const result = await payload.find({
      collection: 'users',
      where: { authIdentityId: { equals: session.user.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    // The CMS owns editorial roles. Product signup never creates an editor or administrator.
    return { user: result.docs[0] ?? null }
  },
}
