import {
  BriefcaseBusiness,
  BookOpen,
  CirclePlay,
  CodeXml,
  ExternalLink,
  Home,
  Info,
  Mail,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'
import type { HeaderNavigation } from '@/payload-types'

const icons = {
  'book-open': BookOpen,
  'external-link': ExternalLink,
  github: CodeXml,
  home: Home,
  info: Info,
  linkedin: BriefcaseBusiness,
  mail: Mail,
  search: Search,
  'shopping-bag': ShoppingBag,
  twitter: X,
  user: User,
  youtube: CirclePlay,
}

type HeaderNavigationItem = NonNullable<HeaderNavigation['items']>[number]

export function getHeaderNavigationPresentation(item: HeaderNavigationItem) {
  const Icon = item.icon ? icons[item.icon as keyof typeof icons] : undefined
  return { Icon, iconOnly: Boolean(Icon && item.iconOnly) }
}
