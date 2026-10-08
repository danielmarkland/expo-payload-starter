import type { AuthService } from '@starter/auth'
import type { ProductUser } from '@starter/core'
import type { Session } from '@supabase/supabase-js'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AppState, Platform } from 'react-native'

import { identity, betterAuthEnabled } from '@/src/lib/identity'
import { getSupabaseClient } from '@/src/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

type AuthContextValue = AuthService

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  return betterAuthEnabled ? (
    <BetterAuthProvider>{children}</BetterAuthProvider>
  ) : (
    <LegacyAuthProvider>{children}</LegacyAuthProvider>
  )
}
function BetterAuthProvider({ children }: PropsWithChildren) {
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
function LegacyAuthProvider({ children }: PropsWithChildren) {
  const supabase = getSupabaseClient()

  const [initialized, setInitialized] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setInitialized(true)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setInitialized(true)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    if (Platform.OS === 'web') return
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh()
      else supabase.auth.stopAutoRefresh()
    })
    return () => subscription.remove()
  }, [supabase.auth])

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = Linking.createURL('auth/callback')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    })
    if (error) throw error
    if (Platform.OS === 'web' || !data.url) return

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    if (result.type !== 'success') return
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      result.url,
    )
    if (exchangeError) throw exchangeError
  }, [supabase.auth])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [supabase.auth])

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      signInWithGoogle,
      signInWithFacebook: async () => {
        throw Error('Activate Better Auth to use Facebook')
      },
      signInWithEmail: async () => {
        throw Error('Activate Better Auth to use email sign in')
      },
      signUpWithEmail: async () => {
        throw Error('Activate Better Auth to use email sign up')
      },
      sendPhoneCode: async () => {
        throw Error('Activate Better Auth to use SMS')
      },
      verifyPhoneCode: async () => {
        throw Error('Activate Better Auth to use SMS')
      },
      requestPasswordReset: async () => {
        throw Error('Activate Better Auth to use password recovery')
      },
      signOut,
      user: toProductUser(session),
    }),
    [initialized, session, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function toProductUser(session: Session | null): ProductUser | null {
  if (!session) return null
  return { email: session.user.email ?? null, id: session.user.id }
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
