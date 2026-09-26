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
  resolveThemeMode,
  themes,
  type ThemeMode,
} from '@starter/design-tokens'

type ThemeContextValue = {
  colors: (typeof themes)[ThemeMode]
  mode: ThemeMode
  ready: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme()
  const [preference, setPreference] = useState<ThemeMode | null>(null)
  const [ready, setReady] = useState(false)
  const mode = resolveThemeMode(systemMode, preference)

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
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark'
    setPreference(next)
    void savePreference(next)
  }, [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({ colors: themes[mode], mode, ready, toggleTheme }),
    [mode, ready, toggleTheme],
  )

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
