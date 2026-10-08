import type { ProductUser } from '@starter/core'

export interface AuthState {
  initialized: boolean
  user: ProductUser | null
}

export interface AuthActions {
  signInWithGoogle(): Promise<void>
  signInWithFacebook(): Promise<void>
  signInWithEmail(email: string, password: string): Promise<void>
  signUpWithEmail(email: string, password: string, name: string): Promise<void>
  sendPhoneCode(phoneNumber: string): Promise<void>
  verifyPhoneCode(phoneNumber: string, code: string): Promise<void>
  requestPasswordReset(email: string): Promise<void>
  signOut(): Promise<void>
}

export type AuthService = AuthActions & AuthState

export function ownsResource(
  user: ProductUser | null,
  ownerId: string,
): boolean {
  return user?.id === ownerId
}
