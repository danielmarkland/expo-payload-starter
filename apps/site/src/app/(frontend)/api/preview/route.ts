import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { createPreviewHandler } from '@danielmarkland/publishing-core/preview'
import { getPreviewSecret } from '@/lib/serverConfig'
export const GET = createPreviewHandler({
  getSecret: getPreviewSecret,
  enableDraftMode: async () => {
    ;(await draftMode()).enable()
  },
  redirect,
})
