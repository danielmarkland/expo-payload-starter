import { documentMetadata } from '@danielmarkland/publishing-core/publishingRules'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { PageRenderer } from '@/components/PageRenderer'
import { getPage } from '@/lib/getPage'
import { getSitePresentation } from '@/lib/getSiteSettings'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  const { config: siteConfig, metadata } = await getSitePresentation()
  return documentMetadata(page, metadata.description || siteConfig.identity.description)
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  if (slug === 'home') redirect('/')

  const page = await getPage(slug)
  if (!page) notFound()

  return <PageRenderer page={page} />
}
