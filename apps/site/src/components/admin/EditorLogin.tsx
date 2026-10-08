'use client'
import { useState, type FormEvent } from 'react'
import { IdentityLogin } from '@danielmarkland/publishing-ui/IdentityLogin'
import { createAuthClient } from '@danielmarkland/auth-runtime/react'
const auth = createAuthClient({ basePath: '/api/editor-auth' })
export function EditorLogin() {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [recovery, setRecovery] = useState(false),
    [message, setMessage] = useState('')
  const token =
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('token')
  async function email(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const fields = new FormData(event.currentTarget)
    try {
      if (token) {
        const result = await auth.resetPassword({
          token,
          newPassword: String(fields.get('password')),
        })
        if (result.error) throw Error(result.error.message)
        window.location.assign('/admin/login')
        return
      }
      if (recovery) {
        const result = await auth.requestPasswordReset({
          email: String(fields.get('email')),
          redirectTo: '/admin/login',
        })
        if (result.error) throw Error(result.error.message)
        setMessage('If this account exists, check your email for a recovery link.')
        return
      }
      const result = await auth.signIn.email({
        email: String(fields.get('email')),
        password: String(fields.get('password')),
      })
      if (result.error) throw Error(result.error.message)
      window.location.assign('/admin')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function social(provider: 'google' | 'facebook') {
    setError('')
    const result = await auth.signIn.social({ provider, callbackURL: '/admin' })
    if (result.error) setError(result.error.message ?? 'Sign in failed')
  }
  return (
    <IdentityLogin
      token={token}
      recovery={recovery}
      busy={busy}
      message={message}
      error={error}
      onEmail={(event) => void email(event)}
      onSocial={(provider) => void social(provider)}
      onRecovery={() => setRecovery(true)}
    />
  )
}
