import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function getPage(slug: string) {
  const { isEnabled } = await draftMode()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    draft: isEnabled,
    limit: 1,
    overrideAccess: isEnabled,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(isEnabled ? [] : [{ _status: { equals: 'published' as const } }]),
      ],
    },
  })

  return result.docs[0]
}
