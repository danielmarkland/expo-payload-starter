import { z } from 'zod'
const publicEnvSchema = z.object({ EXPO_PUBLIC_SITE_URL: z.url() })
export const publicEnv = publicEnvSchema.parse({
  EXPO_PUBLIC_SITE_URL: process.env.EXPO_PUBLIC_SITE_URL,
})
