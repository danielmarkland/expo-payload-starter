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
    'drop schema if exists identity cascade;drop schema if exists app cascade;drop schema if exists auth cascade;create schema app;create schema auth;',
  )
  await pool.query(`create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb,created_at timestamptz,updated_at timestamptz);
 create table auth.identities(id uuid,user_id uuid,provider text,provider_id text,created_at timestamptz,updated_at timestamptz);
 create table app.profiles(id uuid primary key references auth.users(id),display_name text,avatar_url text,created_at timestamptz default now(),updated_at timestamptz default now());alter table app.profiles enable row level security;
 insert into auth.users values('${owner}','owner@example.test',now(),'{}',now(),now());insert into app.profiles(id) values('${owner}');`)
  await pool.query(
    await readFile('../../supabase/migrations/20261008000000_better_auth_product.sql', 'utf8'),
  )
}, 30000)
afterAll(async () => {
  if (pool) await pool.end()
})
it.skipIf(!connectionString)(
  'preserves product identities and confines profiles to the verified actor, including concurrent callers',
  async () => {
    const user = await pool.query("select id from identity.records where model='user'")
    expect(user.rows[0].id).toBe(owner)
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
    await pool.query('set role authenticated')
    await expect(pool.query('select * from app.profiles')).rejects.toThrow()
    await pool.query('reset role')
  },
)
