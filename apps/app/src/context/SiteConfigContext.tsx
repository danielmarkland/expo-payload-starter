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
import { AppState, Platform } from 'react-native'

import { siteConfigSchema, type SiteConfig } from '@danielmarkland/contracts'
import { brand, themes } from '@danielmarkland/design-tokens'
import { api } from '@/src/lib/api'

const CACHE_KEY = 'site-config-v1'

export const fallbackSiteConfig: SiteConfig = {
  integrations: {
    googleTagManagerId: null,
    turnstileSiteKey: null,
  },
  identity: {
    appTitle: brand.appTitle,
    darkLogoUrl: null,
    description: brand.description,
    faviconUrl: null,
    lightLogoUrl: null,
    logoUrl: null,
    shortName: brand.shortName,
    siteTitle: brand.siteTitle,
  },
  theme: {
    allowToggle: true,
    buttonShape: 'square',
    dark: themes.dark,
    defaultMode: 'system',
    densityPreset: 'comfortable',
    fontPreset: 'poppins',
    light: themes.light,
    shapePreset: 'soft',
  },
  version: 1,
}

type SiteConfigContextValue = {
  config: SiteConfig
  ready: boolean
  refresh: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null)

export function SiteConfigProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState(fallbackSiteConfig)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5_000)
    try {
      const next = await Promise.race([
        api.getSiteConfig(),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () =>
            reject(new Error('Site config timed out.')),
          )
        }),
      ])
      setConfig(next)
      await writeCache(JSON.stringify(next))
    } catch {
      // Keep the last valid cached config, or the packaged fallback when offline.
    } finally {
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    let active = true
    void readCache()
      .then((cached) => {
        if (!active || !cached) return
        const parsed = siteConfigSchema.safeParse(JSON.parse(cached))
        if (parsed.success) setConfig(parsed.data)
      })
      .catch(() => undefined)
      .finally(() => {
        if (!active) return
        void refresh().finally(() => {
          if (active) setReady(true)
        })
      })

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh()
    })
    return () => {
      active = false
      subscription.remove()
    }
  }, [refresh])

  const value = useMemo(
    () => ({ config, ready, refresh }),
    [config, ready, refresh],
  )
  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const value = useContext(SiteConfigContext)
  if (!value)
    throw new Error('useSiteConfig must be used within SiteConfigProvider')
  return value
}

async function readCache() {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(CACHE_KEY)
    } catch {
      return null
    }
  }
  return SecureStore.getItemAsync(CACHE_KEY)
}

async function writeCache(value: string) {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(CACHE_KEY, value)
    } catch {
      // The fetched value remains available for this session.
    }
    return
  }
  try {
    await SecureStore.setItemAsync(CACHE_KEY, value)
  } catch {
    // The fetched value remains available for this session.
  }
}
