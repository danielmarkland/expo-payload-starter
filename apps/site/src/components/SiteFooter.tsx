import { createSiteFooter } from '@danielmarkland/publishing-ui/SiteFooter'
import { footerLatestPostsLimit } from '@danielmarkland/publishing-core/footerLayout'
import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { ContactForm } from '@/components/ContactForm'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ContentLink } from '@/components/LinkAction'
import { getHeaderNavigationIcon } from '@/lib/headerNavigationIcons'
import { getNavigationDocuments, getPublishedPosts } from '@/lib/api/content'
const Footer = createSiteFooter({
  ContactForm,
  NewsletterForm,
  ContentLink,
  getHeaderNavigationIcon,
})
export async function SiteFooter({ siteConfig }: { siteConfig: SiteConfig }) {
  const navigation = await getNavigationDocuments()
  const limit = footerLatestPostsLimit(navigation.footer.contentAreas)
  const posts = limit ? await getPublishedPosts(`?limit=${limit}`) : { docs: [] }
  return <Footer siteConfig={siteConfig} navigation={navigation.footer} posts={posts} />
}
