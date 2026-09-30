import * as SecureStore from 'expo-secure-store'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Platform, useColorScheme } from 'react-native'

import {
  THEME_STORAGE_KEY,
  fonts as bundledFonts,
  getPresetTokens,
  type ThemeMode,
} from '@danielmarkland/design-tokens'
import { useSiteConfig } from '@/src/context/SiteConfigContext'

type ThemeContextValue = {
  allowToggle: boolean
  colors: ReturnType<typeof useSiteConfig>['config']['theme']['dark']
  fonts: Record<keyof typeof bundledFonts, string | undefined>
  mode: ThemeMode
  radii: ReturnType<typeof getPresetTokens>['radii']
  ready: boolean
  spacing: ReturnType<typeof getPresetTokens>['spacing']
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const { config, ready: configReady } = useSiteConfig()
  const systemMode = useColorScheme()
  const [preference, setPreference] = useState<ThemeMode | null>(null)
  const [ready, setReady] = useState(false)
  const configuredMode =
    config.theme.defaultMode === 'system'
      ? systemMode === 'light'
        ? 'light'
        : 'dark'
      : config.theme.defaultMode
  const mode = config.theme.allowToggle
    ? (preference ?? configuredMode)
    : configuredMode

  useEffect(() => {
    let active = true
    void readPreference()
      .then((saved) => {
        if (active && (saved === 'dark' || saved === 'light'))
          setPreference(saved)
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  const toggleTheme = useCallback(() => {
    if (!config.theme.allowToggle) return
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark'
    setPreference(next)
    void savePreference(next)
  }, [config.theme.allowToggle, mode])

  const value = useMemo<ThemeContextValue>(() => {
    const preset = getPresetTokens(
      config.theme.densityPreset,
      config.theme.shapePreset,
    )
    return {
      allowToggle: config.theme.allowToggle,
      colors: config.theme[mode],
      fonts:
        config.theme.fontPreset === 'system'
          ? {
              bold: undefined,
              medium: undefined,
              regular: undefined,
              semibold: undefined,
            }
          : bundledFonts,
      mode,
      radii: preset.radii,
      ready: ready && configReady,
      spacing: preset.spacing,
      toggleTheme,
    }
  }, [config, configReady, mode, ready, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used within ThemeProvider')
  return value
}

async function readPreference(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      return null
    }
  }
  try {
    return await SecureStore.getItemAsync(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

async function savePreference(mode: ThemeMode): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {
      // Keep the in-memory choice if browser storage is unavailable.
    }
    return
  }
  try {
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode)
  } catch {
    // Keep the in-memory choice if device storage is unavailable.
  }
}
