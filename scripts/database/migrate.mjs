import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const require = createRequire(
  new URL('../../apps/site/package.json', import.meta.url),
)
const { Client } = require('pg')
export async function runMigrations(
  client,
  directory = new URL('../../database/migrations/', import.meta.url),
) {
  await client.query("select pg_advisory_lock(hashtext('starter:migrations'))")
  try {
    await client.query(
      'create schema if not exists starter_migrations; revoke all on schema starter_migrations from public; create table if not exists starter_migrations.applied (name text primary key, checksum text not null, applied_at timestamptz not null default now())',
    )
    const files = (await readdir(directory))
      .filter((name) => /^\d{14}_[a-z0-9_]+\.sql$/.test(name))
      .sort()
    if (!files.length) throw new Error('No application migrations found')
    const { rows } = await client.query(
      'select name,checksum from starter_migrations.applied',
    )
    const known = new Map(rows.map((row) => [row.name, row.checksum]))
    for (const name of known.keys())
      if (!files.includes(name))
        throw new Error(`Applied migration is missing: ${name}`)
    const applied = []
    for (const name of files) {
      const sql = await readFile(
        new URL(
          name,
          typeof directory === 'string'
            ? pathToFileURL(`${resolve(directory)}/`)
            : directory,
        ),
        'utf8',
      )
      const checksum = createHash('sha256').update(sql).digest('hex')
      if (known.has(name)) {
        if (known.get(name) !== checksum)
          throw new Error(`Applied migration was modified: ${name}`)
        continue
      }
      await client.query('begin')
      try {
        await client.query(sql)
        await client.query(
          'insert into starter_migrations.applied(name,checksum) values($1,$2)',
          [name, checksum],
        )
        await client.query('commit')
        applied.push(name)
      } catch (error) {
        await client.query('rollback')
        throw error
      }
    }
    return applied
  } finally {
    await client.query(
      "select pg_advisory_unlock(hashtext('starter:migrations'))",
    )
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const connectionString = process.env.DATABASE_MIGRATION_URL
  if (!connectionString) throw new Error('DATABASE_MIGRATION_URL is required')
  if (new URL(connectionString).hostname.includes('-pooler'))
    throw new Error('Migrations require a direct database connection')
  const client = new Client({ connectionString })
  try {
    await client.connect()
    console.info(JSON.stringify({ applied: await runMigrations(client) }))
  } finally {
    await client.end()
  }
}
