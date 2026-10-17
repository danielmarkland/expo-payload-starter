'use client'
import { useEffect, useId, useState, useRef } from 'react'
import { Button } from './FunnelControls.js'

export type CommerceOrder = {
  id: string
  name: string
  processedAt: string
  totalPrice: { amount: string; currencyCode: string }
  financialStatus?: string | null
  fulfillmentStatus?: string
  lineItems?: {
    nodes: { id: string; title: string; quantity: number }[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}
export type CustomerCommerceActions = {
  connection: () => Promise<{ connected: boolean }>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  orders: (input: { after?: string }) => Promise<{
    nodes: CommerceOrder[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }>
  order: (
    id: string,
    input?: { after?: string },
  ) => Promise<{ order: CommerceOrder | null }>
}
// The host owns authentication, top-level redirects, authorization and tokens.
export function CustomerCommerce({
  authenticated,
  onSignIn,
  actions,
}: {
  authenticated: boolean
  onSignIn: () => void
  actions: CustomerCommerceActions
}) {
  const heading = useId(),
    epoch = useRef(0)
  const [connected, setConnected] = useState(false),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0)
  const [orders, setOrders] = useState<CommerceOrder[]>([]),
    [after, setAfter] = useState<string | undefined>(),
    [next, setNext] = useState<string | null>(null),
    [selected, setSelected] = useState<CommerceOrder | null>(null)
  useEffect(() => {
    const current = ++epoch.current
    let stopped = false
    setBusy(false)
    setReady(false)
    setError('')
    setOrders([])
    setSelected(null)
    setConnected(false)
    setNext(null)
    if (!authenticated) {
      setReady(true)
      return
    }
    actions
      .connection()
      .then(async (status) => {
        if (stopped) return
        setConnected(status.connected)
        if (status.connected) {
          const result = await actions.orders({ after })
          if (stopped) return
          setOrders(result.nodes)
          setNext(
            result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null,
          )
        }
      })
      .catch(() => {
        if (!stopped)
          setError(
            'Your store account could not be loaded. Try again or reconnect.',
          )
      })
      .finally(() => {
        if (!stopped) setReady(true)
      })
    return () => {
      stopped = true
      if (epoch.current === current) epoch.current++
    }
  }, [actions, authenticated, after, revision])
  async function run(action: (current: () => boolean) => Promise<void>) {
    const generation = epoch.current
    const current = () => epoch.current === generation
    setBusy(true)
    setError('')
    try {
      await action(current)
    } catch {
      if (current())
        setError(
          'That action could not be completed. Try again. You may need to sign in again before changing your store account.',
        )
    } finally {
      if (current()) setBusy(false)
    }
  }
  const disabled = busy || !ready
  return (
    <section className="customer-commerce" aria-labelledby={heading}>
      <h2 id={heading}>Your store account</h2>
      {!authenticated ? (
        <>
          <p>Sign in to connect your store account and view orders.</p>
          <Button type="button" onClick={onSignIn}>
            Sign in
          </Button>
        </>
      ) : (
        <>
          {!ready ? <p role="status">Loading your store account…</p> : null}
          {error ? <p role="alert">{error}</p> : null}
          {error ? (
            <>
              <Button
                type="button"
                disabled={disabled}
                onClick={() => setRevision((n) => n + 1)}
              >
                Retry
              </Button>
              <Button
                type="button"
                disabled={disabled}
                onClick={() =>
                  void run(async (current) => {
                    await actions.connect()
                    if (current()) setRevision((n) => n + 1)
                  })
                }
              >
                Reconnect store account
              </Button>
            </>
          ) : null}
          {ready && !connected && !error ? (
            <>
              <p>Connect your Shopify account to view your orders.</p>
              <Button
                type="button"
                disabled={disabled}
                onClick={() =>
                  void run(async (current) => {
                    await actions.connect()
                    if (current()) setRevision((n) => n + 1)
                  })
                }
              >
                Connect store account
              </Button>
            </>
          ) : null}
          {connected ? (
            <>
              <p>Your Shopify account is connected.</p>
              <Button
                type="button"
                secondary
                disabled={disabled}
                onClick={() =>
                  void run(async (current) => {
                    await actions.disconnect()
                    if (!current()) return
                    setConnected(false)
                    setOrders([])
                    setSelected(null)
                    setAfter(undefined)
                    setNext(null)
                  })
                }
              >
                Disconnect store account
              </Button>
              <h3>Your orders</h3>
              {ready && !busy && !error && !orders.length ? (
                <p>No orders were found for your connected Shopify account.</p>
              ) : null}
              <ul>
                {orders.map((order) => (
                  <li key={order.id}>
                    <Button
                      type="button"
                      secondary
                      disabled={disabled}
                      onClick={() =>
                        void run(async (current) => {
                          const result = await actions.order(order.id)
                          if (!current()) return
                          setSelected(result.order)
                          if (!result.order)
                            setError('This order is unavailable.')
                        })
                      }
                    >
                      {order.name}
                    </Button>
                    {' · '}
                    {order.processedAt.slice(0, 10)}
                    {' · '}
                    {order.totalPrice.amount} {order.totalPrice.currencyCode}
                  </li>
                ))}
              </ul>
              {after ? (
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => setAfter(undefined)}
                >
                  First page
                </Button>
              ) : null}
              {next ? (
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => setAfter(next)}
                >
                  Next page
                </Button>
              ) : null}
              {selected ? (
                <section aria-label="Order details">
                  <h4>{selected.name}</h4>
                  <p>{selected.processedAt.slice(0, 10)}</p>
                  <p>
                    {selected.totalPrice.amount}{' '}
                    {selected.totalPrice.currencyCode}
                  </p>
                  {selected.financialStatus ? (
                    <p>
                      Payment:{' '}
                      {selected.financialStatus
                        .replaceAll('_', ' ')
                        .toLowerCase()}
                    </p>
                  ) : null}
                  {selected.fulfillmentStatus ? (
                    <p>
                      Fulfillment:{' '}
                      {selected.fulfillmentStatus
                        .replaceAll('_', ' ')
                        .toLowerCase()}
                    </p>
                  ) : null}
                  <ul>
                    {selected.lineItems?.nodes.map((item) => (
                      <li key={item.id}>
                        {item.title} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  {selected.lineItems?.pageInfo.hasNextPage &&
                  selected.lineItems.pageInfo.endCursor ? (
                    <Button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        void run(async (current) => {
                          const result = await actions.order(selected.id, {
                            after: selected.lineItems!.pageInfo.endCursor!,
                          })
                          if (current() && result.order?.lineItems)
                            setSelected({
                              ...result.order,
                              lineItems: {
                                ...result.order.lineItems,
                                nodes: [
                                  ...selected.lineItems!.nodes,
                                  ...result.order.lineItems.nodes,
                                ],
                              },
                            })
                        })
                      }
                    >
                      More order items
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    secondary
                    onClick={() => setSelected(null)}
                  >
                    Close order details
                  </Button>
                </section>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
