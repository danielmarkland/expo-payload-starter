'use client'
import { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

export function NewsletterDestinationField({
  path,
  endpoint,
}: {
  path: string
  endpoint: string
}) {
  const { value, setValue } = useField<string>({ path })
  const [destinations, setDestinations] = useState<
    { id: string; name: string; isDefault: boolean }[]
  >([])
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    void fetch(endpoint, {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error('Newsletter destinations could not be loaded.')
        return response.json()
      })
      .then((result) => setDestinations(result.destinations))
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message)
      })
    return () => controller.abort()
  }, [endpoint])
  return (
    <div className="field-type text">
      <label htmlFor={path}>Newsletter destination</label>
      <select
        id={path}
        value={value || ''}
        onChange={(e) => setValue(e.target.value || null)}
        disabled={!destinations.length}
      >
        <option value="">
          {destinations.some((d) => d.isDefault)
            ? 'Site default'
            : 'Select a destination'}
        </option>
        {value && !destinations.some((d) => d.id === value) ? (
          <option value={value}>Unavailable destination: {value}</option>
        ) : null}
        {destinations.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert">{error}</p>
      ) : !destinations.length ? (
        <p>
          Configure an enabled newsletter connection and destination in
          Services.
        </p>
      ) : null}
    </div>
  )
}
