import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { PageRenderer } from '@/components/PageRenderer'
import { getPage } from '@/lib/getPage'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}

  return {
    description: page.seo?.description,
    title: page.seo?.title || page.title,
  }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  if (slug === 'home') redirect('/')

  const page = await getPage(slug)
  if (!page) notFound()

  return <PageRenderer page={page} />
}
