import { getPayload, type Migration } from 'payload'

import config from '../payload.config'
import { migrations } from '../migrations'

const payload = await getPayload({ config })

try {
  // The adapter's concrete migration arguments are narrower than Payload's
  // database-agnostic Migration type, although this is the format it executes.
  await payload.db.migrate({ migrations: migrations as unknown as Migration[] })
} finally {
  await payload.destroy()
}
