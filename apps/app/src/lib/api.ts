import { createApiClient } from '@starter/api-client'

import { publicEnv } from '@/src/config/env'
import { supabase } from '@/src/lib/supabase'

export const api = createApiClient({
  baseUrl: `${publicEnv.EXPO_PUBLIC_SITE_URL}/api/v1`,
  getAccessToken: async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  },
})
