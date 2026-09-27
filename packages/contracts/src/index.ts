import { z } from 'zod'

export const profileSchema = z.object({
  avatarUrl: z.url().nullable(),
  createdAt: z.iso.datetime(),
  displayName: z.string().nullable(),
  id: z.uuid(),
  updatedAt: z.iso.datetime(),
})

export type Profile = z.infer<typeof profileSchema>

export const welcomeEmailRequestSchema = z.object({
  idempotencyKey: z.uuid(),
})

export type WelcomeEmailRequest = z.infer<typeof welcomeEmailRequestSchema>

export const emailDeliveryEventSchema = z.object({
  createdAt: z.iso.datetime(),
  emailId: z.string().min(1),
  status: z.enum(['sent', 'delivered', 'bounced', 'complained']),
})

export type EmailDeliveryEvent = z.infer<typeof emailDeliveryEventSchema>

export const contactSubmissionSchema = z.object({
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
  name: z.string().trim().min(2).max(100),
  turnstileToken: z.string().min(1).max(2048),
  website: z.string().max(200).optional().default(''),
})

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>

export const themeModeSchema = z.enum(['system', 'light', 'dark'])
export const fontPresetSchema = z.enum(['poppins', 'system'])
export const shapePresetSchema = z.enum(['square', 'soft', 'rounded'])
export const densityPresetSchema = z.enum([
  'compact',
  'comfortable',
  'spacious',
])
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)

export const themeColorsSchema = z.object({
  accentSoft: hexColorSchema,
  border: hexColorSchema,
  borderInput: hexColorSchema,
  danger: hexColorSchema,
  dangerAlpha: z.string().regex(/^#[0-9a-fA-F]{8}$/),
  ink: hexColorSchema,
  inkBody: hexColorSchema,
  inkDim: hexColorSchema,
  inkFaint: hexColorSchema,
  inkGhost: hexColorSchema,
  inkInverse: hexColorSchema,
  inkLight: hexColorSchema,
  inkMuted: hexColorSchema,
  inkSubtle: hexColorSchema,
  lineStrong: hexColorSchema,
  primary: hexColorSchema,
  primaryHover: hexColorSchema,
  primaryInk: hexColorSchema,
  secondary: hexColorSchema,
  surface: hexColorSchema,
  surfaceFooter: hexColorSchema,
  surfaceInput: hexColorSchema,
  surfaceRaised: hexColorSchema,
  surfaceSection: hexColorSchema,
  surfaceTop: hexColorSchema,
  warning: hexColorSchema,
})

export const siteConfigSchema = z.object({
  version: z.literal(1),
  identity: z.object({
    appTitle: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    faviconUrl: z.url().nullable(),
    logoUrl: z.url().nullable(),
    shortName: z.string().min(1).max(12),
    siteTitle: z.string().min(1).max(100),
  }),
  theme: z.object({
    allowToggle: z.boolean(),
    dark: themeColorsSchema,
    defaultMode: themeModeSchema,
    densityPreset: densityPresetSchema,
    fontPreset: fontPresetSchema,
    light: themeColorsSchema,
    shapePreset: shapePresetSchema,
  }),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>
