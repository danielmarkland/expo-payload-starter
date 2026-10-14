import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import {
  CustomerCommerce,
  type CustomerCommerceActions,
} from './CustomerCommerce.js'
afterEach(cleanup)
function actions(
  authenticated = false,
  connected = false,
): CustomerCommerceActions {
  return {
    session: async () => ({ authenticated }),
    signIn: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
    connection: async () => ({ connected }),
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    orders: async () => ({ nodes: [] }),
    products: async () => ({
      nodes: [
        {
          id: 'product-a',
          title: 'Test record',
          description: 'A record',
          price: { amount: '12.00', currencyCode: 'USD' },
        },
      ],
    }),
  }
}
describe('CustomerCommerce', () => {
  it('shows public products and Google login without requesting private orders', async () => {
    const api = actions()
    api.orders = vi.fn(api.orders)
    render(<CustomerCommerce title="Store" actions={api} />)
    expect(await screen.findByText('Continue with Google')).toBeTruthy()
    expect(await screen.findByText('Test record')).toBeTruthy()
    expect(api.orders).not.toHaveBeenCalled()
  })
  it('shows account connection before requesting orders', async () => {
    const api = actions(true)
    api.orders = vi.fn(api.orders)
    render(<CustomerCommerce title="Store" actions={api} />)
    expect(await screen.findByText('Connect Shopify account')).toBeTruthy()
    expect(api.orders).not.toHaveBeenCalled()
  })
  it('shows the authorized empty-order state', async () => {
    render(<CustomerCommerce title="Store" actions={actions(true, true)} />)
    await waitFor(() =>
      expect(
        screen.getByText(
          'No orders were found for your connected Shopify account.',
        ),
      ).toBeTruthy(),
    )
  })
})
