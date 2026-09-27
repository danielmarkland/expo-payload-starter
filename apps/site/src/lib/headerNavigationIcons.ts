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

export function getHeaderNavigationIcon(icon?: null | string) {
  return icon ? icons[icon as keyof typeof icons] : undefined
}

export function getHeaderNavigationPresentation(item: HeaderNavigationItem) {
  const Icon = getHeaderNavigationIcon(item.icon)
  return { Icon, iconOnly: Boolean(Icon && item.iconOnly) }
}

export function getSearchNavigationPresentation(
  navigation: Pick<HeaderNavigation, 'searchIcon' | 'showSearch'>,
) {
  return {
    Icon: getHeaderNavigationIcon(navigation.searchIcon),
    show: navigation.showSearch !== false,
  }
}
