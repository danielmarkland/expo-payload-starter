import type { SiteConfig } from '@starter/contracts'
import { brand, getPresetTokens, layout, radii, themes, typography } from '@starter/design-tokens'
import type { SiteSetting } from '@/payload-types'

type ResolvedThemeColors = SiteConfig['theme']['dark']
type PaletteInput = Partial<
  Pick<
    ResolvedThemeColors,
    'border' | 'ink' | 'inkMuted' | 'primary' | 'primaryInk' | 'surface' | 'surfaceRaised'
  >
> & { accent?: null | string }

function channel(value: string, offset: number) {
  return Number.parseInt(value.slice(offset, offset + 2), 16)
}

function mixHex(background: string, foreground: string, foregroundRatio: number) {
  const mixed = [1, 3, 5].map((offset) =>
    Math.round(
      channel(background, offset) * (1 - foregroundRatio) +
        channel(foreground, offset) * foregroundRatio,
    )
      .toString(16)
      .padStart(2, '0'),
  )
  return `#${mixed.join('')}`
}

function resolvePalette(mode: 'dark' | 'light', input?: PaletteInput | null): ResolvedThemeColors {
  const fallback = themes[mode]
  if (!input) return fallback

  const primary = input.primary || fallback.primary
  const primaryInk = input.primaryInk || fallback.primaryInk
  const accent = input.accent || fallback.secondary
  const surface = input.surface || fallback.surface
  const surfaceRaised = input.surfaceRaised || fallback.surfaceRaised
  const ink = input.ink || fallback.ink
  const inkMuted = input.inkMuted || fallback.inkMuted
  const border = input.border || fallback.border
  const changed = Object.values(input).some(Boolean)
  if (!changed) return fallback

  return {
    ...fallback,
    accentSoft: mixHex(surface, accent, 0.2),
    border,
    borderInput: mixHex(surface, ink, 0.18),
    ink,
    inkBody: mixHex(surface, ink, 0.9),
    inkDim: mixHex(surface, ink, 0.48),
    inkFaint: mixHex(surface, ink, 0.2),
    inkGhost: mixHex(surface, ink, 0.28),
    inkInverse: surface,
    inkLight: mixHex(surface, ink, 0.78),
    inkMuted,
    inkSubtle: mixHex(surface, ink, 0.38),
    lineStrong: mixHex(surface, ink, 0.28),
    primary,
    primaryHover: mixHex(primary, ink, mode === 'dark' ? 0.2 : 0.12),
    primaryInk,
    secondary: accent,
    surface,
    surfaceFooter: mixHex(surface, ink, 0.035),
    surfaceInput: mixHex(surface, ink, 0.08),
    surfaceRaised,
    surfaceSection: mixHex(surface, ink, 0.025),
    surfaceTop: mixHex(surface, ink, 0.12),
  }
}

type MediaValue = { url?: null | string } | number | null | undefined

function mediaURL(value: MediaValue, siteURL: string) {
  const url = value && typeof value === 'object' ? value.url : null
  return url ? new URL(url, siteURL).toString() : null
}

export function resolveSiteConfig(
  settings: SiteSetting,
  siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
): SiteConfig {
  const darkLogoUrl = mediaURL(settings.darkLogo, siteURL)
  const lightLogoUrl = mediaURL(settings.lightLogo, siteURL)

  return {
    version: 1,
    identity: {
      appTitle: settings.appTitle || brand.appTitle,
      darkLogoUrl,
      description: settings.siteDescription || brand.description,
      faviconUrl: mediaURL(settings.favicon, siteURL),
      lightLogoUrl,
      logoUrl: darkLogoUrl,
      shortName: settings.shortName || brand.shortName,
      siteTitle: settings.siteTitle || brand.siteTitle,
    },
    theme: {
      allowToggle: settings.theme?.allowToggle ?? true,
      buttonShape: settings.buttons?.shape || 'square',
      dark: resolvePalette('dark', settings.theme?.dark),
      defaultMode: settings.theme?.defaultMode || 'system',
      densityPreset: settings.theme?.densityPreset || 'comfortable',
      fontPreset: settings.theme?.fontPreset || 'poppins',
      light: resolvePalette('light', settings.theme?.light),
      shapePreset: settings.theme?.shapePreset || 'soft',
    },
  }
}

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function declarations(values: Record<string, string | number>, prefix: string, unit = '') {
  return Object.entries(values)
    .map(([key, value]) => `--${prefix}-${kebabCase(key)}:${value}${unit};`)
    .join('')
}

export function siteConfigCSS(config: SiteConfig) {
  const preset = getPresetTokens(config.theme.densityPreset, config.theme.shapePreset)
  const shared = [
    declarations(typography.weights, 'font-weight'),
    declarations(typography.fontSizes, 'font-size', 'px'),
    declarations(typography.lineHeights, 'line-height'),
    declarations(preset.spacing, 'space', 'px'),
    declarations(preset.radii, 'radius', 'px'),
    `--radius-button:${
      config.theme.buttonShape === 'square'
        ? 0
        : config.theme.buttonShape === 'soft'
          ? radii.sm
          : config.theme.buttonShape === 'rounded'
            ? radii.lg
            : radii.pill
    }px;`,
    declarations(layout, 'layout', 'px'),
    `--font-family-runtime:${config.theme.fontPreset === 'system' ? 'ui-sans-serif,system-ui,sans-serif' : 'var(--font-family-sans)'};`,
  ].join('')
  const dark = declarations(config.theme.dark, 'color')
  const light = declarations(config.theme.light, 'color')

  return `:root{color-scheme:dark;${dark}${shared}}:root[data-theme='light']{color-scheme:light;${light}}@media(prefers-color-scheme:light){:root:not([data-theme]){color-scheme:light;${light}}}`
}
