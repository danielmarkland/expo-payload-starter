import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProductWidget } from './ProductWidget'
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
