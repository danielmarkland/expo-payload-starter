'use client'
import { useRef, useState, type FormEvent } from 'react'
type FormStatus = 'error' | 'idle' | 'sending' | 'success'
/** Owns submission/retry/captcha state; each form owns its fields and markup. */
export function usePublishingFormSubmission({
  endpoint,
  siteKey,
  fields,
}: {
  endpoint: string
  siteKey: string | null
  fields: (data: FormData) => Record<string, unknown>
}) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [turnstileKey, setTurnstileKey] = useState(0)
  const inFlight = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || !siteKey) return
    const form = event.currentTarget
    inFlight.current = true
    setStatus('sending')
    try {
      const data = new FormData(form)
      const response = await fetch(endpoint, {
        body: JSON.stringify({
          ...fields(data),
          turnstileToken: data.get('cf-turnstile-response'),
          website: data.get('website'),
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Form submission failed')
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setTurnstileKey((value) => value + 1)
      inFlight.current = false
    }
  }
  return { status, turnstileKey, submit }
}
