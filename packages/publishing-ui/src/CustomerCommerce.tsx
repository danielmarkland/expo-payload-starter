'use client'
import { useEffect, useState } from 'react'
import { Button } from './FunnelControls.js'

export type CustomerCommerceActions = {
  session: () => Promise<{ authenticated: boolean; name?: string }>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  connection: () => Promise<{ connected: boolean }>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  orders: () => Promise<{
    nodes: {
      id: string
      name?: string
      processedAt?: string
      totalPrice?: { amount: string; currencyCode: string }
    }[]
  }>
  products: () => Promise<{
    nodes: {
      id: string
      title: string
      description: string
      image?: { url: string; alt: string }
      price?: { amount: string; currencyCode: string }
    }[]
  }>
}

export function CustomerCommerce({
  title,
  actions,
}: {
  title: string
  actions: CustomerCommerceActions
}) {
  const [session, setSession] = useState<{
    authenticated: boolean
    name?: string
  }>({ authenticated: false })
  const [connected, setConnected] = useState(false),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false)
  const [error, setError] = useState(''),
    [products, setProducts] = useState<
      Awaited<ReturnType<CustomerCommerceActions['products']>>['nodes']
    >([])
  const [orders, setOrders] = useState<
    Awaited<ReturnType<CustomerCommerceActions['orders']>>['nodes']
  >([])
  const [catalogError, setCatalogError] = useState(''),
    [catalogReady, setCatalogReady] = useState(false)
  useEffect(() => {
    let stopped = false
    actions
      .session()
      .then(async (current) => {
        if (stopped) return
        setSession(current)
        if (current.authenticated) {
          const link = await actions.connection()
          if (stopped) return
          setConnected(link.connected)
          if (link.connected) {
            const result = await actions.orders()
            if (!stopped) setOrders(result.nodes)
          }
        }
      })
      .catch(() => {
        if (!stopped)
          setError(
            'Account information could not be loaded. Refresh and try again.',
          )
      })
      .finally(() => {
        if (!stopped) setReady(true)
      })
    actions
      .products()
      .then((result) => {
        if (!stopped) setProducts(result.nodes)
      })
      .catch(() => {
        if (!stopped)
          setCatalogError(
            'Products are unavailable. Please refresh and try again.',
          )
      })
      .finally(() => {
        if (!stopped) setCatalogReady(true)
      })
    return () => {
      stopped = true
    }
  }, [actions])
  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch {
      setError('That action could not be completed. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="customer-commerce">
      <header>
        <h1>{title}</h1>
        <p>Shop and manage your store account.</p>
      </header>
      <section aria-labelledby="customer-account-heading">
        <h2 id="customer-account-heading">Your account</h2>
        {!ready ? (
          <p role="status">Loading your account…</p>
        ) : !session.authenticated ? (
          <>
            <p>Sign in to connect your store account and view orders.</p>
            <Button disabled={busy} onClick={() => void run(actions.signIn)}>
              Continue with Google
            </Button>
          </>
        ) : (
          <>
            <p>Signed in{session.name ? ' as ' + session.name : ''}.</p>
            {connected ? (
              <>
                <p role="status">Your Shopify account is connected.</p>
                <Button
                  secondary
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await actions.disconnect()
                      setConnected(false)
                      setOrders([])
                    })
                  }
                >
                  Disconnect store account
                </Button>
                <h3>Your orders</h3>
                {orders.length ? (
                  <ul>
                    {orders.map((order) => (
                      <li key={order.id}>
                        {order.name || 'Order'}
                        {order.processedAt
                          ? ' · ' +
                            new Date(order.processedAt).toLocaleDateString()
                          : ''}
                        {order.totalPrice
                          ? ' · ' +
                            order.totalPrice.amount +
                            ' ' +
                            order.totalPrice.currencyCode
                          : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No orders were found for your connected Shopify account.
                  </p>
                )}
              </>
            ) : (
              <>
                <p>
                  Connect your Shopify customer account to view your orders.
                </p>
                <Button
                  disabled={busy}
                  onClick={() => void run(actions.connect)}
                >
                  Connect Shopify account
                </Button>
              </>
            )}
            <Button
              secondary
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await actions.signOut()
                  setSession({ authenticated: false })
                  setConnected(false)
                  setOrders([])
                })
              }
            >
              Sign out
            </Button>
          </>
        )}
        {error ? <p role="alert">{error}</p> : null}
      </section>
      <section aria-labelledby="shop-products-heading">
        <h2 id="shop-products-heading">Shop</h2>
        {!catalogReady ? (
          <p role="status">Loading products…</p>
        ) : catalogError ? (
          <p role="alert">{catalogError}</p>
        ) : !products.length ? (
          <p>No products are available yet.</p>
        ) : (
          <ul className="customer-commerce-products">
            {products.map((product) => (
              <li key={product.id}>
                {product.image ? (
                  <img
                    src={product.image.url}
                    alt={product.image.alt}
                    loading="lazy"
                  />
                ) : null}
                <h3>{product.title}</h3>
                {product.price ? (
                  <p>
                    {product.price.amount} {product.price.currencyCode}
                  </p>
                ) : null}
                <p>{product.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
