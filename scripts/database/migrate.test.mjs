import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { runMigrations } from './migrate.mjs'
const require = createRequire(
  new URL('../../apps/site/package.json', import.meta.url),
)
const { Client } = require('pg')
const connectionString = process.env.MIGRATION_TEST_DATABASE_URL

test(
  'rolls back a failed migration, retries safely, and rejects rewritten or missing history',
  { skip: !connectionString },
  async () => {
    const url = new URL(connectionString)
    assert.ok(
      ['localhost', '127.0.0.1'].includes(url.hostname) &&
        url.pathname.endsWith('_test'),
      'Dedicated disposable local database required',
    )
    const folder = await mkdtemp(join(tmpdir(), 'groovepost-migrations-'))
    const client = new Client({ connectionString })
    const first = join(folder, '20261011000001_first.sql'),
      second = join(folder, '20261011000002_second.sql')
    await client.connect()
    try {
      await client.query(
        'drop schema if exists starter_migrations cascade;drop schema if exists migration_fixture cascade',
      )
      await writeFile(
        first,
        'create schema migration_fixture;create table migration_fixture.rows(id integer primary key);insert into migration_fixture.rows values(1);',
      )
      await writeFile(
        second,
        'insert into migration_fixture.rows values(2);select missing_function();',
      )
      await assert.rejects(runMigrations(client, folder), /missing_function/)
      assert.deepEqual(
        (await client.query('select id from migration_fixture.rows')).rows,
        [{ id: 1 }],
      )
      await writeFile(second, 'insert into migration_fixture.rows values(2);')
      assert.deepEqual(await runMigrations(client, folder), [
        '20261011000002_second.sql',
      ])
      assert.deepEqual(await runMigrations(client, folder), [])
      assert.deepEqual(
        (
          await client.query(
            'select id from migration_fixture.rows order by id',
          )
        ).rows,
        [{ id: 1 }, { id: 2 }],
      )
      await writeFile(first, 'select 1;')
      await assert.rejects(runMigrations(client, folder), /was modified/)
      await rm(first)
      await assert.rejects(runMigrations(client, folder), /is missing/)
    } finally {
      await client.query(
        'drop schema if exists starter_migrations cascade;drop schema if exists migration_fixture cascade',
      )
      await client.end()
      await rm(folder, { recursive: true, force: true })
    }
  },
)
