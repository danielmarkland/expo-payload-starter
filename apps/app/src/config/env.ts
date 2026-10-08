import { z } from 'zod'

const publicEnvSchema = z.object({
  EXPO_PUBLIC_SITE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_SUPABASE_URL: z.url().optional(),
})

export const publicEnv = publicEnvSchema.parse({
  EXPO_PUBLIC_SITE_URL: process.env.EXPO_PUBLIC_SITE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
})
