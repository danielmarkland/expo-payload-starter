import type { Profile } from '@danielmarkland/contracts'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.js'

type AppClient = SupabaseClient<Database, 'app'>

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>
  updateDisplayName(id: string, displayName: string | null): Promise<Profile>
}

export function createProfileRepository(client: AppClient): ProfileRepository {
  return {
    async findById(id) {
      const { data, error } = await client
        .from('profiles')
        .select('id, display_name, avatar_url, created_at, updated_at')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data ? toProfile(data) : null
    },
    async updateDisplayName(id, displayName) {
      const { data, error } = await client
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', id)
        .select('id, display_name, avatar_url, created_at, updated_at')
        .single()
      if (error) throw error
      return toProfile(data)
    },
  }
}

type ProfileRow = Database['app']['Tables']['profiles']['Row']

function toProfile(row: ProfileRow): Profile {
  return {
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    displayName: row.display_name,
    id: row.id,
    updatedAt: row.updated_at,
  }
}

export type { Database } from './database.js'
