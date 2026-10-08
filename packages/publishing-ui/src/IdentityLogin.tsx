'use client'
import type { FormEvent } from 'react'
export type IdentityLoginProps = {
  token: string | null
  recovery: boolean
  busy: boolean
  message: string
  error: string
  onEmail: (event: FormEvent<HTMLFormElement>) => void
  onSocial: (provider: 'google' | 'facebook') => void
  onRecovery: () => void
}
export function IdentityLogin({
  token,
  recovery,
  busy,
  message,
  error,
  onEmail,
  onSocial,
  onRecovery,
}: IdentityLoginProps) {
  return (
    <main>
      <h1>
        {token
          ? 'Set a new password'
          : recovery
            ? 'Recover editorial access'
            : 'Editorial sign in'}
      </h1>
      <form onSubmit={onEmail}>
        {!token ? (
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
        ) : null}
        {!recovery ? (
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={token ? 'new-password' : 'current-password'}
              minLength={token ? 8 : undefined}
              required
            />
          </label>
        ) : null}
        <button disabled={busy}>
          {token
            ? 'Save password'
            : recovery
              ? 'Send recovery link'
              : 'Sign in'}
        </button>
      </form>
      {!token && !recovery ? (
        <>
          <button onClick={() => void onSocial('google')}>
            Continue with Google
          </button>
          <button onClick={() => void onSocial('facebook')}>
            Continue with Facebook
          </button>
          <button onClick={onRecovery}>Forgot password?</button>
        </>
      ) : null}
      {message ? <p role="status">{message}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </main>
  )
}
