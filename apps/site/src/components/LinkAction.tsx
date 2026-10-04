import { createLinkComponents } from '@danielmarkland/publishing-ui/LinkAction'
import { getLinkIcon } from '@/lib/linkIcons'
export type { LinkPresentation } from '@danielmarkland/publishing-ui/LinkAction'
export const { LinkLabel, ContentLink, ActionLink } = createLinkComponents(getLinkIcon)
