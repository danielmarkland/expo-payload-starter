import brandConfig from './brand.json' with { type: 'json' }
import tokenConfig from './tokens.json' with { type: 'json' }

export type ThemeMode = keyof typeof tokenConfig.themes
export type ThemeColors = (typeof tokenConfig.themes)[ThemeMode]

export const brand = brandConfig
export const THEME_STORAGE_KEY = brand.themeStorageKey
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
