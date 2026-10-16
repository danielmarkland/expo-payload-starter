import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { ProductWidget } from './ProductWidget'
afterEach(cleanup)
describe('product widget', () => {
  it('preserves editorial extensions and routes commerce actions to host callbacks', () => {
    const open = vi.fn(),
      add = vi.fn()
    render(
      <ProductWidget title="Record" available onOpen={open} onAdd={add}>
        <p>Sampled by this artist</p>
      </ProductWidget>,
    )
    expect(screen.getByText('Sampled by this artist')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Record' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(open).toHaveBeenCalledOnce()
    expect(add).toHaveBeenCalledOnce()
  })
  it('prevents adding unavailable products', () => {
    const add = vi.fn()
    render(
      <ProductWidget
        title="Unavailable"
        available={false}
        onOpen={() => {}}
        onAdd={add}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sold out' }))
    expect(add).not.toHaveBeenCalled()
  })
})

it('blocks duplicate cart actions while pending without submitting a surrounding form', () => {
  const submit = vi.fn((event) => event.preventDefault()),
    add = vi.fn(),
    open = vi.fn()
  const { rerender } = render(
    <form onSubmit={submit}>
      <ProductWidget title="Record" available busy onOpen={open} onAdd={add} />
    </form>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Adding…' }))
  expect(add).not.toHaveBeenCalled()
  expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('true')
  rerender(
    <form onSubmit={submit}>
      <ProductWidget title="Record" available onOpen={open} onAdd={add} />
    </form>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Record' }))
  fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
  expect(open).toHaveBeenCalledOnce()
  expect(add).toHaveBeenCalledOnce()
  expect(submit).not.toHaveBeenCalled()
})
