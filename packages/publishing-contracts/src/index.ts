import { z } from 'zod'

export * from './api.js'

export const contactSubmissionSchema = z
  .object({
    email: z.email().max(254),
    message: z.string().trim().min(10).max(5000),
    name: z.string().trim().min(2).max(100).optional(),
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    company: z.string().trim().max(200).optional(),
    turnstileToken: z.string().min(1).max(2048),
    website: z.string().max(200).optional().default(''),
  })
  .refine(
    (value) => Boolean(value.name || (value.firstName && value.lastName)),
    {
      message: 'Provide a name or both first and last names.',
      path: ['name'],
    },
  )

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>

export const newsletterSubmissionSchema = z.object({
  email: z.email().max(254),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  turnstileToken: z.string().min(1).max(2048),
  website: z.string().max(200).optional().default(''),
})

export type NewsletterSubmission = z.infer<typeof newsletterSubmissionSchema>

export const themeModeSchema = z.enum(['system', 'light', 'dark'])
export const fontPresetSchema = z.enum([
  'poppins',
  'system',
  'inter',
  'ibm-plex-mono',
])
export const shapePresetSchema = z.enum(['square', 'soft', 'rounded'])
export const buttonShapeSchema = z.enum(['square', 'soft', 'rounded', 'pill'])
export const densityPresetSchema = z.enum([
  'compact',
  'comfortable',
  'spacious',
])
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)

export const themeColorsSchema = z.object({
  darkSurface: hexColorSchema.optional(),
  darkInk: hexColorSchema.optional(),
  darkInkMuted: hexColorSchema.optional(),
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

export const archivePresentationSchema = z.object({
  pageSize: z.number().int().min(1).max(48).default(12),
  columns: z.enum(['auto', '2', '3', '4']).default('auto'),
  imageProportion: z
    .enum(['landscape', 'square', 'original'])
    .default('landscape'),
  presentation: z.enum(['card', 'simple']).default('card'),
  titleAlignment: z.enum(['left', 'center']).default('left'),
  titleSurface: z
    .enum(['default', 'raised', 'accent', 'dark', 'light'])
    .default('default'),
  listSurface: z
    .enum(['default', 'raised', 'accent', 'dark', 'light'])
    .default('default'),
})
export type ArchivePresentation = z.infer<typeof archivePresentationSchema>

export const siteConfigSchema = z.object({
  archive: archivePresentationSchema.default(() =>
    archivePresentationSchema.parse({}),
  ),
  version: z.literal(1),
  integrations: z
    .object({
      googleTagManagerId: z
        .string()
        .regex(/^GTM-[A-Z0-9]+$/i)
        .nullable()
        .default(null),
      turnstileSiteKey: z.string().min(1).nullable().default(null),
    })
    .default({ googleTagManagerId: null, turnstileSiteKey: null }),
  identity: z.object({
    appTitle: z.string().min(1).max(100),
    darkLogoUrl: z.url().nullable().default(null),
    description: z.string().min(1).max(500),
    faviconUrl: z.url().nullable(),
    lightLogoUrl: z.url().nullable().default(null),
    logoUrl: z.url().nullable(),
    shortName: z.string().min(1).max(12),
    siteTitle: z.string().min(1).max(100),
  }),
  theme: z.object({
    allowToggle: z.boolean(),
    buttonShape: buttonShapeSchema.default('square'),
    dark: themeColorsSchema,
    defaultMode: themeModeSchema,
    densityPreset: densityPresetSchema,
    fontPreset: fontPresetSchema,
    headingFont: fontPresetSchema.nullable().optional(),
    bodyFont: fontPresetSchema.nullable().optional(),
    labelFont: fontPresetSchema.nullable().optional(),
    headingWeight: z.enum(['600', '700', '800']).nullable().optional(),
    typographyPreset: z
      .enum(['compact', 'standard', 'editorial'])
      .nullable()
      .optional(),
    light: themeColorsSchema,
    shapePreset: shapePresetSchema,
  }),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

export * from './landingPages.js'
