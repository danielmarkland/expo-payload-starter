import type { Metadata } from 'next'
import localFont from 'next/font/local'
import React from 'react'

import { brand } from '@starter/design-tokens'
import favicon from '@starter/design-tokens/assets/favicon.png'
import appIcon from '@starter/design-tokens/assets/icon.png'

import { GoogleTagManager } from '@/components/GoogleTagManager'
import { SiteHeader } from '@/components/SiteHeader'

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

export const metadata: Metadata = {
  applicationName: brand.siteTitle,
  description: brand.description,
  icons: { apple: appIcon.src, icon: favicon.src },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: brand.siteTitle, template: `%s · ${brand.siteTitle}` },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.variable}>
        <GoogleTagManager />
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
