import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react'
import { afterEach, it, expect, vi } from 'vitest'
import {
  CustomerCommerce,
  type CustomerCommerceActions,
} from './CustomerCommerce'
afterEach(cleanup)
const order = {
  id: 'order',
  name: '#1001',
  processedAt: '2026-10-16T12:00:00Z',
  totalPrice: { amount: '20.00', currencyCode: 'USD' },
}
function actions(): CustomerCommerceActions {
  return {
    connection: vi.fn(async () => ({ connected: true })),
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    orders: vi.fn(async () => ({
      nodes: [order],
      pageInfo: { hasNextPage: true, endCursor: 'next' },
    })),
    order: vi.fn(async () => ({ order })),
  }
}
it('delegates configured sign-in without fetching private data while signed out', () => {
  const api = actions(),
    signIn = vi.fn()
  render(
    <CustomerCommerce authenticated={false} onSignIn={signIn} actions={api} />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  expect(signIn).toHaveBeenCalledOnce()
  expect(api.orders).not.toHaveBeenCalled()
  expect(api.connection).not.toHaveBeenCalled()
})
it('keeps failed order reads distinct from an empty order list and allows retry', async () => {
  const api = actions()
  vi.mocked(api.orders).mockRejectedValueOnce(new Error('offline'))
  render(<CustomerCommerce authenticated onSignIn={() => {}} actions={api} />)
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.queryByText(/No orders were found/)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByRole('button', { name: '#1001' })).toBeTruthy()
})
it('paginates, loads an authorized order and clears private state on logout', async () => {
  const api = actions()
  const view = render(
    <CustomerCommerce authenticated onSignIn={() => {}} actions={api} />,
  )
  fireEvent.click(await screen.findByRole('button', { name: 'Next page' }))
  await waitFor(() =>
    expect(api.orders).toHaveBeenCalledWith({ after: 'next' }),
  )
  fireEvent.click(await screen.findByRole('button', { name: '#1001' }))
  expect(
    await screen.findByRole('region', { name: 'Order details' }),
  ).toBeTruthy()
  expect(api.order).toHaveBeenCalledWith('order')
  view.rerender(
    <CustomerCommerce
      authenticated={false}
      onSignIn={() => {}}
      actions={api}
    />,
  )
  expect(screen.queryByText('#1001')).toBeNull()
})
it('disables pending disconnects and does not submit surrounding forms', async () => {
  const api = actions()
  let finish!: () => void
  vi.mocked(api.disconnect).mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      }),
  )
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault())
  render(
    <form onSubmit={submit}>
      <CustomerCommerce authenticated onSignIn={() => {}} actions={api} />
    </form>,
  )
  const button = await screen.findByRole('button', {
    name: 'Disconnect store account',
  })
  fireEvent.click(button)
  expect((button as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(button)
  expect(api.disconnect).toHaveBeenCalledOnce()
  expect(submit).not.toHaveBeenCalled()
  finish()
  expect(
    await screen.findByRole('button', { name: 'Connect store account' }),
  ).toBeTruthy()
})
it('ignores stale order loads after a session ends', async () => {
  const api = actions()
  let finish!: (
    value: Awaited<ReturnType<CustomerCommerceActions['orders']>>,
  ) => void
  vi.mocked(api.orders).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  const view = render(
    <CustomerCommerce authenticated onSignIn={() => {}} actions={api} />,
  )
  await waitFor(() => expect(api.orders).toHaveBeenCalledOnce())
  view.rerender(
    <CustomerCommerce
      authenticated={false}
      onSignIn={() => {}}
      actions={api}
    />,
  )
  finish({ nodes: [order], pageInfo: { hasNextPage: false, endCursor: null } })
  await waitFor(() => expect(screen.queryByText('#1001')).toBeNull())
})
it('discards a delayed private order detail after logout', async () => {
  const api = actions()
  let finish!: (value: { order: typeof order }) => void
  vi.mocked(api.order).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  const view = render(
    <CustomerCommerce authenticated onSignIn={() => {}} actions={api} />,
  )
  fireEvent.click(await screen.findByRole('button', { name: '#1001' }))
  await waitFor(() => expect(api.order).toHaveBeenCalledOnce())
  view.rerender(
    <CustomerCommerce
      authenticated={false}
      onSignIn={() => {}}
      actions={api}
    />,
  )
  finish({ order })
  await waitFor(() =>
    expect(screen.queryByRole('region', { name: 'Order details' })).toBeNull(),
  )
})
it('loads all order line pages without losing earlier items', async () => {
  const api = actions(),
    lineItems = {
      nodes: [{ id: 'line-1', title: 'Record A', quantity: 1 }],
      pageInfo: { hasNextPage: true, endCursor: 'line-next' },
    }
  vi.mocked(api.order)
    .mockResolvedValueOnce({ order: { ...order, lineItems } })
    .mockResolvedValueOnce({
      order: {
        ...order,
        lineItems: {
          nodes: [{ id: 'line-2', title: 'Record B', quantity: 2 }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    })
  render(<CustomerCommerce authenticated onSignIn={() => {}} actions={api} />)
  fireEvent.click(await screen.findByRole('button', { name: '#1001' }))
  fireEvent.click(
    await screen.findByRole('button', { name: 'More order items' }),
  )
  expect(await screen.findByText('Record B × 2')).toBeTruthy()
  expect(screen.getByText('Record A × 1')).toBeTruthy()
  expect(api.order).toHaveBeenLastCalledWith('order', { after: 'line-next' })
})
