import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageRenderer } from '@/components/PageRenderer'
import { getPage } from '@/lib/getPage'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('home')
  if (!page) return {}

  return {
    description: page.seo?.description,
    title: page.seo?.title || page.title,
  }
}

export default async function HomePage() {
  const page = await getPage('home')
  if (!page) notFound()

  return <PageRenderer page={page} />
}
