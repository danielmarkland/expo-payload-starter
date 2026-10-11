// @vitest-environment node
import { Pool } from 'pg'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { beforeAll, afterAll, it, expect } from 'vitest'
import { createPostgresProfileRepository } from '@starter/data'
const connectionString = process.env.PRODUCT_AUTH_TEST_DATABASE_URL
let pool: Pool
const owner = randomUUID(),
  other = randomUUID()
beforeAll(async () => {
  if (!connectionString) return
  const url = new URL(connectionString)
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || !url.pathname.endsWith('_test'))
    throw Error('Dedicated local test database required')
  pool = new Pool({ connectionString })
  await pool.query(
    'drop schema if exists identity cascade;drop schema if exists app cascade;drop role if exists product_test_browser;',
  )
  await pool.query(
    await readFile('../../database/migrations/20261011000000_beta_baseline.sql', 'utf8'),
  )
  await pool.query('insert into app.profiles(id) values($1)', [owner])
  await pool.query(
    'create role product_test_browser nologin nosuperuser nocreatedb nocreaterole noreplication nobypassrls',
  )
}, 30000)
afterAll(async () => {
  if (pool) await pool.end()
})
it.skipIf(!connectionString)(
  'confines profiles to the verified actor, including concurrent callers',
  async () => {
    const own = createPostgresProfileRepository(pool, owner),
      different = createPostgresProfileRepository(pool, other)
    const rows = await Promise.all([own.findById(owner), different.findById(other)])
    expect(rows.map((row) => row?.id)).toEqual([owner, other])
    expect(await own.findById(other)).toBeNull()
    await expect(own.updateDisplayName(other, 'Intruder')).rejects.toThrow()
    expect((await own.updateDisplayName(owner, 'Owner')).displayName).toBe('Owner')
    const client = await pool.connect()
    try {
      expect(
        (await client.query("select current_user,current_setting('starter.actor',true) as actor"))
          .rows[0].actor,
      ).not.toBe(owner)
    } finally {
      client.release()
    }
    await pool.query('set role product_test_browser')
    await expect(pool.query('select * from app.profiles')).rejects.toThrow()
    await pool.query('reset role')
  },
)
