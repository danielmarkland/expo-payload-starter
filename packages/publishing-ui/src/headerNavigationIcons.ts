import type { ApiHeaderNavigation as HeaderNavigation } from '@danielmarkland/publishing-contracts'
import { getLinkIcon } from './linkIcons.js'

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
