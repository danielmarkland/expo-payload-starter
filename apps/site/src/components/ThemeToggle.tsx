'use client'

import { ThemeToggle as SharedThemeToggle } from '@danielmarkland/publishing-ui/ThemeToggle'
import { THEME_STORAGE_KEY, type SiteTheme } from '@/theme'

export function ThemeToggle({ defaultMode = 'system' }: { defaultMode?: SiteTheme | 'system' }) {
  return <SharedThemeToggle defaultMode={defaultMode} storageKey={THEME_STORAGE_KEY} />
}
