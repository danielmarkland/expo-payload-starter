import {
  ArrowRight,
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
  'arrow-right': ArrowRight,
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

export function getLinkIcon(icon?: null | string) {
  return icon ? icons[icon as keyof typeof icons] : undefined
}

export const getHeaderNavigationIcon = getLinkIcon

export function getHeaderNavigationPresentation(item: {
  icon?: null | string
  iconOnly?: null | boolean
}) {
  const Icon = getLinkIcon(item.icon)
  return { Icon, iconOnly: Boolean(Icon && item.iconOnly) }
}

export function getSearchNavigationPresentation(
  navigation: Pick<HeaderNavigation, 'searchIcon' | 'showSearch'>,
) {
  return {
    Icon: getLinkIcon(navigation.searchIcon),
    show: navigation.showSearch !== false,
  }
}
