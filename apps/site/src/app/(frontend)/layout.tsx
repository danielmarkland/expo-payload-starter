import { siteDocumentMetadata } from '@danielmarkland/publishing-core/publishingRules'
import { themeBootstrapScript } from '@danielmarkland/publishing-core/siteConfig'
import type { Metadata } from 'next'
import { publishingFontClassName } from '@danielmarkland/publishing-ui/fonts'
import React from 'react'

import { THEME_STORAGE_KEY } from '@starter/brand'
import favicon from '@starter/brand/assets/favicon.png'
import appIcon from '@starter/brand/assets/icon.png'

import { GoogleTagManager } from '@/components/GoogleTagManager'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteConfigProvider } from '@/components/SiteConfigProvider'
import { getSitePresentation } from '@/lib/getSiteSettings'
import { getSiteURL } from '@/lib/serverConfig'
import { siteConfigCSS } from '@/lib/siteConfig'

import '@danielmarkland/design-tokens/theme.css'
import './styles.css'

export async function generateMetadata(): Promise<Metadata> {
  const { config: siteConfig, metadata } = await getSitePresentation()

  return siteDocumentMetadata(siteConfig, metadata, {
    siteURL: getSiteURL(),
    icon: favicon.src,
    appleIcon: appIcon.src,
  })
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { config: siteConfig } = await getSitePresentation()
  const bootstrap = themeBootstrapScript(siteConfig.theme, THEME_STORAGE_KEY)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: siteConfigCSS(siteConfig) }} />
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body className={publishingFontClassName}>
        <SiteConfigProvider config={siteConfig}>
          <GoogleTagManager containerId={siteConfig.integrations.googleTagManagerId} />
          <SiteHeader siteConfig={siteConfig} />
          {children}
          <SiteFooter siteConfig={siteConfig} />
        </SiteConfigProvider>
      </body>
    </html>
  )
}
