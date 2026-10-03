import tokenConfig from './tokens.json' with { type: 'json' }

export type ThemeMode = keyof typeof tokenConfig.themes
export type ThemeColors = (typeof tokenConfig.themes)[ThemeMode]

export const themes = tokenConfig.themes
export const typography = {
  family: tokenConfig.fonts.family,
  weights: tokenConfig.fonts.weights,
  fontSizes: tokenConfig.fontSizes,
  lineHeights: tokenConfig.lineHeights,
} as const
export const spacing = tokenConfig.spacing
export const radii = tokenConfig.radii
export const layout = tokenConfig.layout

export type DensityPreset = 'compact' | 'comfortable' | 'spacious'
export type ShapePreset = 'rounded' | 'soft' | 'square'

const densityScales: Record<DensityPreset, number> = {
  compact: 0.8,
  comfortable: 1,
  spacious: 1.2,
}

const shapeScales: Record<ShapePreset, number> = {
  rounded: 1.5,
  soft: 1,
  square: 0,
}

export function getPresetTokens(density: DensityPreset, shape: ShapePreset) {
  const densityScale = densityScales[density]
  const shapeScale = shapeScales[shape]
  const scaledSpacing = Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [
      key,
      Math.round(value * densityScale),
    ]),
  ) as typeof spacing
  const scaledRadii = Object.fromEntries(
    Object.entries(radii).map(([key, value]) => [
      key,
      key === 'pill' ? value : Math.round(value * shapeScale),
    ]),
  ) as typeof radii

  return { radii: scaledRadii, spacing: scaledSpacing }
}

// Expo's font files are registered in the root layout and use these family names.
export const fonts = {
  bold: `${tokenConfig.fonts.family}_Bold`,
  medium: `${tokenConfig.fonts.family}_Medium`,
  regular: `${tokenConfig.fonts.family}_Regular`,
  semibold: `${tokenConfig.fonts.family}_SemiBold`,
} as const

// Retained as the default theme for callers that do not yet have theme context.
export const colors = themes.dark

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return themes[mode]
}

export function resolveThemeMode(
  systemMode: ThemeMode | 'unspecified' | null,
  preference: ThemeMode | null,
): ThemeMode {
  return preference ?? (systemMode === 'light' ? 'light' : 'dark')
}
