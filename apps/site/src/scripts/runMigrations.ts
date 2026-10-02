import { getPayload, type Migration } from 'payload'

import config from '../payload.config'
import { migrations } from '../migrations'

const payload = await getPayload({ config })

for (const migration of migrations) {
  console.log(`Checking Payload migration: ${migration.name}`)
  // The adapter's concrete migration arguments are narrower than Payload's
  // database-agnostic Migration type, although this is the format it executes.
  await payload.db.migrate({ migrations: [migration] as unknown as Migration[] })
}

// Payload's database pool can retain handles after migrations finish. This is a
// one-shot command, so terminate once every checked-in migration has completed.
process.exit(0)
