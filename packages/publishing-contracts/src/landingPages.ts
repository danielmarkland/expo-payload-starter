import { z } from 'zod'

export const landingSurfaceSchema = z.enum(['web', 'app'])
export type LandingSurface = z.infer<typeof landingSurfaceSchema>

export const landingPageSchema = z.object({
  body: z.string().nullable(),
  eyebrow: z.string().nullable(),
  heading: z.string().nullable(),
  showLogo: z.boolean(),
  surface: landingSurfaceSchema,
})

export type LandingPageContent = z.infer<typeof landingPageSchema>
