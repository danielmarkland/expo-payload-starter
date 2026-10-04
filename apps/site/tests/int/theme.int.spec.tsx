import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { THEME_STORAGE_KEY } from '@starter/brand'
import { ThemeToggle } from '@/components/ThemeToggle'

function setSystemTheme(theme: 'dark' | 'light') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((media: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: theme === 'light',
      media,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  })
}

describe('site theme toggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  afterEach(() => cleanup())

  it('starts with the system theme when there is no saved choice', async () => {
    setSystemTheme('light')
    render(<ThemeToggle />)

    const button = await screen.findByRole('button', {
      name: 'Current theme: light mode. Switch to dark mode.',
    })
    expect(button.querySelector('svg')).not.toBeNull()
    expect(button.textContent).toBe('')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('persists a manual theme choice', async () => {
    setSystemTheme('dark')
    render(<ThemeToggle />)

    const button = await screen.findByRole('button', {
      name: 'Current theme: dark mode. Switch to light mode.',
    })
    fireEvent.click(button)

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light')
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })
  })

  it('prefers a saved choice over the system setting', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    setSystemTheme('light')
    render(<ThemeToggle />)

    await screen.findByRole('button', {
      name: 'Current theme: dark mode. Switch to light mode.',
    })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('keeps a configured default instead of following later system changes', async () => {
    setSystemTheme('light')
    render(<ThemeToggle defaultMode="dark" />)

    await screen.findByRole('button', {
      name: 'Current theme: dark mode. Switch to light mode.',
    })
    const media = vi.mocked(window.matchMedia).mock.results[0]?.value
    expect(media.addEventListener).not.toHaveBeenCalled()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
