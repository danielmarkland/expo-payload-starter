import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageRenderer } from '@/components/PageRenderer'
import { getPage } from '@/lib/getPage'
import { getSitePresentation } from '@/lib/getSiteSettings'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('home')
  if (!page) return {}
  const { config: siteConfig, metadata } = await getSitePresentation()
  const image = page.meta?.image && typeof page.meta.image === 'object' ? page.meta.image.url : null

  return {
    description: page.meta?.description || metadata.description || siteConfig.identity.description,
    openGraph: image ? { images: [image] } : undefined,
    title: page.meta?.title || page.title,
  }
}

export default async function HomePage() {
  const page = await getPage('home')
  if (!page) notFound()

  return <PageRenderer page={page} />
}
