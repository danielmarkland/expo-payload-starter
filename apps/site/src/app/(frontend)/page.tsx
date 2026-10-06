import { documentMetadata } from '@danielmarkland/publishing-core/publishingRules'
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
  return documentMetadata(page, metadata.description || siteConfig.identity.description)
}

export default async function HomePage() {
  const page = await getPage('home')
  if (!page) notFound()

  return <PageRenderer page={page} />
}
