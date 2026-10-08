import { createApiClient } from '@starter/api-client'

import { publicEnv } from '@/src/config/env'
import { getSupabaseClient } from '@/src/lib/supabase'
import { identity, betterAuthEnabled } from '@/src/lib/identity'

export const api = createApiClient({
  baseUrl: `${publicEnv.EXPO_PUBLIC_SITE_URL}/api/v1`,
  getAccessToken: async () => {
    if (betterAuthEnabled)
      return (await identity.getSession()).data?.session.token ?? null
    const { data } = await getSupabaseClient().auth.getSession()
    return data.session?.access_token ?? null
  },
})
