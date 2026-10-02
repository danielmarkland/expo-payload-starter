import { getPayload, type Migration } from 'payload'

import config from '../payload.config'
import { migrations } from '../migrations'

const payload = await getPayload({ config })

try {
  for (const migration of migrations) {
    console.log(`Checking Payload migration: ${migration.name}`)
    // The adapter's concrete migration arguments are narrower than Payload's
    // database-agnostic Migration type, although this is the format it executes.
    await payload.db.migrate({ migrations: [migration] as unknown as Migration[] })
  }
} finally {
  await payload.destroy()
}

process.exit(0)
