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

import { supabase } from '@/src/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

type AuthContextValue = AuthService

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
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
  }, [])

  useEffect(() => {
    if (Platform.OS === 'web') return
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh()
      else supabase.auth.stopAutoRefresh()
    })
    return () => subscription.remove()
  }, [])

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
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      signInWithGoogle,
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
