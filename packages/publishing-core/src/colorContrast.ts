import type { TextFieldValidation } from 'payload'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const MINIMUM_TEXT_CONTRAST = 4.5

export type PaletteColorName =
  | 'darkSurface'
  | 'darkInk'
  | 'accent'
  | 'border'
  | 'ink'
  | 'inkMuted'
  | 'primary'
  | 'primaryInk'
  | 'surface'
  | 'surfaceRaised'

const labels: Record<PaletteColorName, string> = {
  darkSurface: 'Dark section background',
  darkInk: 'Dark section text',
  accent: 'Accent',
  border: 'Borders',
  ink: 'Primary text',
  inkMuted: 'Muted text',
  primary: 'Primary',
  primaryInk: 'Text on primary',
  surface: 'Page background',
  surfaceRaised: 'Raised surface',
}

const contrastPairs: Partial<Record<PaletteColorName, PaletteColorName[]>> = {
  darkSurface: ['darkInk'],
  darkInk: ['darkSurface'],
  accent: ['surface', 'surfaceRaised'],
  ink: ['surface', 'surfaceRaised'],
  inkMuted: ['surface', 'surfaceRaised'],
  primary: ['primaryInk'],
  primaryInk: ['primary'],
  surface: ['ink', 'inkMuted', 'accent'],
  surfaceRaised: ['ink', 'inkMuted', 'accent'],
}

function relativeLuminance(value: string) {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255,
  )
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return red! * 0.2126 + green! * 0.7152 + blue! * 0.0722
}

export function colorContrastRatio(first: string, second: string) {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left,
  )
  return (luminances[0]! + 0.05) / (luminances[1]! + 0.05)
}

export function validatePaletteColor(
  name: PaletteColorName,
): TextFieldValidation {
  return (value, { siblingData }) => {
    if (!value) return true
    if (!HEX_COLOR.test(value))
      return 'Enter a six-digit hex color such as #eec784.'
    const palette = {
      ...(siblingData as Record<string, unknown>),
      [name]: value,
    }
    for (const counterpartName of contrastPairs[name] ?? []) {
      const counterpart = palette[counterpartName]
      if (typeof counterpart !== 'string' || !HEX_COLOR.test(counterpart))
        continue
      const ratio = colorContrastRatio(value, counterpart)
      if (ratio < MINIMUM_TEXT_CONTRAST)
        return `${labels[name]} and ${labels[counterpartName]} need at least 4.5:1 contrast (currently ${ratio.toFixed(2)}:1).`
    }
    return true
  }
}
