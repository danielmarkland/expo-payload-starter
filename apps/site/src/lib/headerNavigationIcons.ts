import type { HeaderNavigation } from '@/payload-types'
import { getLinkIcon } from '@/lib/linkIcons'

export { getLinkIcon }

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
