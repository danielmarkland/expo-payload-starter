'use client'

import { createContext, type PropsWithChildren, useContext } from 'react'

import type { SiteConfig } from '@danielmarkland/publishing-contracts'

const SiteConfigContext = createContext<SiteConfig | null>(null)

export function SiteConfigProvider({
  children,
  config,
}: PropsWithChildren<{ config: SiteConfig }>) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const config = useContext(SiteConfigContext)
  if (!config)
    throw new Error('useSiteConfig must be used within SiteConfigProvider')
  return config
}
