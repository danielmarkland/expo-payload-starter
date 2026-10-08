import 'react-native-url-polyfill/auto'

import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

import { authStorage } from '@/src/auth/storage'
import { publicEnv } from '@/src/config/env'
let client: ReturnType<typeof createClient> | undefined
export function getSupabaseClient() {
  if (
    !publicEnv.EXPO_PUBLIC_SUPABASE_URL ||
    !publicEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    throw Error('Legacy Supabase auth configuration is required')
  return (client ??= createClient(
    publicEnv.EXPO_PUBLIC_SUPABASE_URL,
    publicEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: Platform.OS === 'web',
        persistSession: true,
        storage: authStorage,
      },
    },
  ))
}
