import 'react-native-url-polyfill/auto'

import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

import { authStorage } from '@/src/auth/storage'
import { publicEnv } from '@/src/config/env'
export const supabase = createClient(
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
)
