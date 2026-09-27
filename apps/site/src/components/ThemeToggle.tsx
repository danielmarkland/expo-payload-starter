'use client'

import { useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { THEME_STORAGE_KEY, type SiteTheme } from '@/theme'

function getSystemTheme(): SiteTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeToggle({ defaultMode = 'system' }: { defaultMode?: SiteTheme | 'system' }) {
  const [theme, setTheme] = useState<SiteTheme | null>(null)
  const preference = useRef<SiteTheme | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: light)')
    let saved: string | null = null

    try {
      saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Keep using the system theme when browser storage is unavailable.
    }

    preference.current = saved === 'light' || saved === 'dark' ? saved : null
    const configured = defaultMode === 'system' ? null : defaultMode
    const initial = preference.current ?? configured ?? (media.matches ? 'light' : 'dark')
    root.dataset.theme = initial
    setTheme(initial)

    const followSystem = () => {
      if (preference.current) return
      const next = media.matches ? 'light' : 'dark'
      root.dataset.theme = next
      setTheme(next)
    }

    if (defaultMode === 'system') media.addEventListener('change', followSystem)
    return () => {
      if (defaultMode === 'system') media.removeEventListener('change', followSystem)
    }
  }, [defaultMode])

  function toggleTheme() {
    const current = theme ?? getSystemTheme()
    const next: SiteTheme = current === 'dark' ? 'light' : 'dark'
    preference.current = next
    document.documentElement.dataset.theme = next

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // The theme still changes for this page view if storage is unavailable.
    }

    setTheme(next)
  }

  const nextTheme = theme === 'light' ? 'dark' : 'light'
  const currentLabel = theme ? `${theme} mode` : 'system mode'
  const ThemeIcon = nextTheme === 'dark' ? Moon : Sun

  return (
    <button
      aria-label={`Current theme: ${currentLabel}. Switch to ${nextTheme} mode.`}
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${nextTheme} mode`}
      type="button"
    >
      <ThemeIcon aria-hidden="true" />
    </button>
  )
}
