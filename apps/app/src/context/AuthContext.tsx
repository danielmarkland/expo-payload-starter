import type { AuthService } from '@starter/auth'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { createContext, type PropsWithChildren, useContext } from 'react'

import { identity } from '@/src/lib/identity'

WebBrowser.maybeCompleteAuthSession()

type AuthContextValue = AuthService

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending } = identity.useSession()
  const value: AuthContextValue = {
    initialized: !isPending,
    user: data ? { id: data.user.id, email: data.user.email } : null,
    async signInWithGoogle() {
      const result = await identity.signIn.social({
        provider: 'google',
        callbackURL: Linking.createURL('auth/callback'),
      })
      if (result.error) throw Error(result.error.message)
    },
    async signInWithFacebook() {
      const result = await identity.signIn.social({
        provider: 'facebook',
        callbackURL: Linking.createURL('auth/callback'),
      })
      if (result.error) throw Error(result.error.message)
    },
    async signInWithEmail(email, password) {
      const result = await identity.signIn.email({ email, password })
      if (result.error) throw Error(result.error.message)
    },
    async signUpWithEmail(email, password, name) {
      const result = await identity.signUp.email({
        email,
        password,
        name,
        callbackURL: Linking.createURL('auth/callback'),
      })
      if (result.error) throw Error(result.error.message)
    },
    async sendPhoneCode(phoneNumber) {
      const result = await identity.phoneNumber.sendOtp({ phoneNumber })
      if (result.error) throw Error(result.error.message)
    },
    async verifyPhoneCode(phoneNumber, code) {
      const result = await identity.phoneNumber.verify({ phoneNumber, code })
      if (result.error) throw Error(result.error.message)
    },
    async requestPasswordReset(email) {
      const result = await identity.requestPasswordReset({
        email,
        redirectTo: Linking.createURL('reset-password'),
      })
      if (result.error) throw Error(result.error.message)
    },
    async signOut() {
      const result = await identity.signOut()
      if (result.error) throw Error(result.error.message)
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
