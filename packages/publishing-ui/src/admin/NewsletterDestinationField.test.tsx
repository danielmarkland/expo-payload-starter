import {
  render,
  screen,
  waitFor,
  cleanup,
  fireEvent,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const field = vi.hoisted(() => ({ value: '', setValue: vi.fn() }))
vi.mock('@payloadcms/ui', () => ({ useField: () => field }))
import { NewsletterDestinationField } from './NewsletterDestinationField.js'
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  field.value = ''
  field.setValue.mockClear()
})
it('lists only host-provided destinations and selects their portable ID', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json({
        destinations: [{ id: 'campaign', name: 'Campaign', isDefault: true }],
      }),
    ),
  )
  render(
    <NewsletterDestinationField
      path="newsletter.destinationId"
      endpoint="/destinations"
    />,
  )
  await waitFor(() =>
    expect(screen.getByRole('option', { name: 'Campaign' })).toBeTruthy(),
  )
  fireEvent.change(screen.getByLabelText('Newsletter destination'), {
    target: { value: 'campaign' },
  })
  expect(field.setValue).toHaveBeenCalledWith('campaign')
})
it('disables selection when no configured destination is available', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ destinations: [] })),
  )
  render(
    <NewsletterDestinationField
      path="newsletter.destinationId"
      endpoint="/destinations"
    />,
  )
  await waitFor(() =>
    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(
      true,
    ),
  )
  expect(screen.getByText(/Configure an enabled newsletter/)).toBeTruthy()
})
it('preserves an unavailable saved selection for correction without rerouting it', async () => {
  field.value = 'retired'
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json({
        destinations: [{ id: 'campaign', name: 'Campaign', isDefault: true }],
      }),
    ),
  )
  render(
    <NewsletterDestinationField
      path="newsletter.destinationId"
      endpoint="/destinations"
    />,
  )
  await waitFor(() =>
    expect(screen.getByRole('option', { name: 'Campaign' })).toBeTruthy(),
  )
  expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe(
    'retired',
  )
  expect(field.setValue).not.toHaveBeenCalled()
})
