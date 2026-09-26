import { z } from 'zod'

const publicEnvSchema = z.object({
  EXPO_PUBLIC_SITE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  EXPO_PUBLIC_SUPABASE_URL: z.url(),
  EXPO_PUBLIC_GTM_CONTAINER_ID: z
    .string()
    .regex(/^GTM-[A-Z0-9]+$/i)
    .optional(),
})

export const publicEnv = publicEnvSchema.parse({
  EXPO_PUBLIC_SITE_URL: process.env.EXPO_PUBLIC_SITE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_GTM_CONTAINER_ID:
    process.env.EXPO_PUBLIC_GTM_CONTAINER_ID || undefined,
})
