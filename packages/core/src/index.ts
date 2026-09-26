import type { Profile } from '@starter/contracts'

export interface ProductUser {
  email: string | null
  id: string
}

export function profileLabel(
  profile: Pick<Profile, 'displayName'> | null,
  user: ProductUser,
): string {
  const displayName = profile?.displayName?.trim()
  if (displayName) return displayName
  return user.email ?? 'Member'
}
