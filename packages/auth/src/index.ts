import type { ProductUser } from '@starter/core'

export interface AuthState {
  initialized: boolean
  user: ProductUser | null
}

export interface AuthActions {
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
}

export type AuthService = AuthActions & AuthState

export function ownsResource(
  user: ProductUser | null,
  ownerId: string,
): boolean {
  return user?.id === ownerId
}
