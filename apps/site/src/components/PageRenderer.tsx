import { createPageRenderer } from '@danielmarkland/publishing-ui/PageRenderer'
import { ContactForm } from '@/components/ContactForm'
import { LatestPostsSection } from '@/components/LatestPostsSection'
import { ActionLink, ContentLink } from '@/components/LinkAction'
export const PageRenderer = createPageRenderer({
  ContactForm,
  LatestPostsSection,
  ActionLink,
  ContentLink,
})
