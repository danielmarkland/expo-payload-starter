import type { Profile } from '@danielmarkland/contracts'

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>
  updateDisplayName(id: string, displayName: string | null): Promise<Profile>
}

type ProfileRow = {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

function toProfile(row: ProfileRow): Profile {
  return {
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    displayName: row.display_name,
    id: row.id,
    updatedAt: row.updated_at,
  }
}

export type ProfileDatabase = {
  connect(): Promise<{
    query(
      sql: string,
      values?: unknown[],
    ): Promise<{ rows: Record<string, unknown>[] }>
    release(): void
  }>
}
export function createPostgresProfileRepository(
  database: ProfileDatabase,
  actor: string,
): ProfileRepository {
  if (!/^[a-f0-9-]{36}$/i.test(actor))
    throw Error('Verified actor UUID required')
  async function run(sql: string, values: unknown[]) {
    const client = await database.connect()
    try {
      await client.query('begin')
      await client.query('set local role starter_product_runtime')
      await client.query("select set_config('starter.actor',$1,true)", [actor])
      const result = await client.query(sql, values)
      await client.query('commit')
      return result.rows[0]
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  }
  return {
    async findById(id) {
      await run(
        'insert into app.profiles(id) values($1) on conflict do nothing',
        [actor],
      )
      const row = await run(
        'select id,display_name,avatar_url,created_at,updated_at from app.profiles where id=$1',
        [id],
      )
      return row
        ? toProfile({
            ...row,
            created_at: new Date(row.created_at as string).toISOString(),
            updated_at: new Date(row.updated_at as string).toISOString(),
          } as ProfileRow)
        : null
    },
    async updateDisplayName(id, displayName) {
      const row = await run(
        'update app.profiles set display_name=$2 where id=$1 returning id,display_name,avatar_url,created_at,updated_at',
        [id, displayName],
      )
      if (!row) throw Error('Profile not found')
      return toProfile({
        ...row,
        created_at: new Date(row.created_at as string).toISOString(),
        updated_at: new Date(row.updated_at as string).toISOString(),
      } as ProfileRow)
    },
  }
}
