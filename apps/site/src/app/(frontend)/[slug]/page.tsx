import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { PageRenderer } from '@/components/PageRenderer'
import { getPage } from '@/lib/getPage'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { resolveSiteConfig } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  const settings = await getSiteSettings()
  const siteConfig = resolveSiteConfig(settings)
  const image = page.meta?.image && typeof page.meta.image === 'object' ? page.meta.image.url : null

  return {
    description:
      page.meta?.description || settings.meta?.description || siteConfig.identity.description,
    openGraph: image ? { images: [image] } : undefined,
    title: page.meta?.title || page.title,
  }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  if (slug === 'home') redirect('/')

  const page = await getPage(slug)
  if (!page) notFound()

  return <PageRenderer page={page} />
}
