import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { LoadingRegion, Skeleton } from './LoadingRegion'

afterEach(cleanup)
it('keeps the same content mounted while announcing the loading lifetime', () => {
  const view = render(
    <LoadingRegion loading label="Loading screen">
      <Skeleton width="50%" height="44px" />
      <p>Content</p>
    </LoadingRegion>,
  )
  const content = screen.getByText('Content')
  expect(content.parentElement?.getAttribute('aria-busy')).toBe('true')
  expect(screen.getByRole('status').textContent).toBe('Loading screen')
  expect(screen.getByRole('status').closest('[aria-busy]')).toBeNull()
  expect(
    view.container
      .querySelector('.publishing-skeleton')
      ?.getAttribute('aria-hidden'),
  ).toBe('true')
  expect(
    view.container.querySelectorAll('button, input, [tabindex]').length,
  ).toBe(0)
  view.rerender(
    <LoadingRegion loading={false} label="Loading screen">
      <Skeleton width="50%" height="44px" />
      <p>Content</p>
    </LoadingRegion>,
  )
  expect(screen.getByText('Content')).toBe(content)
  expect(content.parentElement?.getAttribute('aria-busy')).toBe('false')
  expect(screen.getByRole('status').textContent).toBe('')
})
