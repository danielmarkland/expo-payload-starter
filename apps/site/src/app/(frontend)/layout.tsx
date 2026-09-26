import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import React from 'react'

import './styles.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  description: 'A production starter for Expo, Payload, Supabase, and Resend.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Expo Payload Starter', template: '%s · Expo Payload Starter' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  )
}
