import { createApiClient } from '@starter/api-client'
import { publicEnv } from '@/src/config/env'
import { identity } from '@/src/lib/identity'
export const api = createApiClient({
  baseUrl: `${publicEnv.EXPO_PUBLIC_SITE_URL}/api/v1`,
  getAccessToken: async () =>
    (await identity.getSession()).data?.session.token ?? null,
})
