import { publishingAdminNavigation } from '@danielmarkland/publishing-core/adminNavigation'
import type { ServerProps } from 'payload'
import { AdminNavGroups } from './AdminNavGroups.js'

export function PublishingNavigationLinks({ user, permissions }: ServerProps) {
  if (!user) return null
  return (
    <AdminNavGroups
      groups={publishingAdminNavigation({
        collections: Object.keys(permissions?.collections ?? {}).filter(
          (slug) => permissions?.collections?.[slug]?.read,
        ),
        globals: Object.keys(permissions?.globals ?? {}).filter(
          (slug) => permissions?.globals?.[slug]?.read,
        ),
      })}
    />
  )
}
