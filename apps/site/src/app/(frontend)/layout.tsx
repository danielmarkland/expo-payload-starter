import type { Metadata } from 'next'
import localFont from 'next/font/local'
import React from 'react'

import { THEME_STORAGE_KEY } from '@starter/design-tokens'
import favicon from '@starter/design-tokens/assets/favicon.png'
import appIcon from '@starter/design-tokens/assets/icon.png'

import { GoogleTagManager } from '@/components/GoogleTagManager'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { resolveSiteConfig, siteConfigCSS } from '@/lib/siteConfig'

import '@starter/design-tokens/theme.css'
import './styles.css'

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
  const settings = await getSiteSettings()
  const siteConfig = resolveSiteConfig(settings)
  const socialImage = settings.meta?.image
  const socialImageURL = socialImage && typeof socialImage === 'object' ? socialImage.url : null
  const uploadedFavicon = settings.favicon
  const faviconURL =
    uploadedFavicon && typeof uploadedFavicon === 'object' ? uploadedFavicon.url : null

  return {
    applicationName: siteConfig.identity.siteTitle,
    description: settings.meta?.description || siteConfig.identity.description,
    icons: { apple: appIcon.src, icon: faviconURL || favicon.src },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    openGraph: {
      description: settings.meta?.description || siteConfig.identity.description,
      images: socialImageURL ? [socialImageURL] : undefined,
      siteName: siteConfig.identity.siteTitle,
    },
    title: {
      default: settings.meta?.title || siteConfig.identity.siteTitle,
      template: `%s · ${siteConfig.identity.siteTitle}`,
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const siteConfig = resolveSiteConfig(settings)
  const bootstrap = `(function(){try{var s=${siteConfig.theme.allowToggle ? `localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})` : 'null'};var d=${JSON.stringify(siteConfig.theme.defaultMode)};var t=s==='light'||s==='dark'?s:d==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):d;document.documentElement.dataset.theme=t}catch(e){}})()`

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: siteConfigCSS(siteConfig) }} />
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body className={font.variable}>
        <GoogleTagManager />
        <SiteHeader siteConfig={siteConfig} />
        {children}
        <SiteFooter siteConfig={siteConfig} />
      </body>
    </html>
  )
}
