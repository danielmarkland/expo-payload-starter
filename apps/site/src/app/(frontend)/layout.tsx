import type { Metadata } from 'next'
import localFont from 'next/font/local'
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
import '@danielmarkland/publishing-ui/layout.css'

const font = localFont({
  display: 'swap',
  src: [
    {
      path: '../../../../../packages/design-tokens/assets/fonts/Poppins_400Regular.ttf',
      weight: '400',
    },
    {
      path: '../../../../../packages/design-tokens/assets/fonts/Poppins_500Medium.ttf',
      weight: '500',
    },
    {
      path: '../../../../../packages/design-tokens/assets/fonts/Poppins_600SemiBold.ttf',
      weight: '600',
    },
    {
      path: '../../../../../packages/design-tokens/assets/fonts/Poppins_700Bold.ttf',
      weight: '700',
    },
  ],
  variable: '--font-family-sans',
})

export async function generateMetadata(): Promise<Metadata> {
  const { config: siteConfig, metadata } = await getSitePresentation()

  return {
    applicationName: siteConfig.identity.siteTitle,
    description: metadata.description,
    icons: { apple: appIcon.src, icon: metadata.faviconUrl || favicon.src },
    metadataBase: new URL(getSiteURL()),
    openGraph: {
      description: metadata.description,
      images: metadata.socialImageUrl ? [metadata.socialImageUrl] : undefined,
      siteName: siteConfig.identity.siteTitle,
    },
    title: {
      default: metadata.title,
      template: `%s · ${siteConfig.identity.siteTitle}`,
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { config: siteConfig } = await getSitePresentation()
  const bootstrap = `(function(){try{var s=${siteConfig.theme.allowToggle ? `localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})` : 'null'};var d=${JSON.stringify(siteConfig.theme.defaultMode)};var t=s==='light'||s==='dark'?s:d==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):d;document.documentElement.dataset.theme=t}catch(e){}})()`

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: siteConfigCSS(siteConfig) }} />
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body className={font.variable}>
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
