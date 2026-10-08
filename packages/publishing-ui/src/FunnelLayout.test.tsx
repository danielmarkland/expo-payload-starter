import { Field } from './FunnelControls'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  ChoiceGroup,
  FunnelLayout,
  StepProgress,
  UploadCard,
} from './FunnelLayout'

describe('shared funnel presentation', () => {
  it('associates custom child controls with labels and error text', () => {
    render(
      <Field label="Contact" error="Enter a contact">
        <input />
      </Field>,
    )
    const input = screen.getByLabelText('Contact')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(
      document.getElementById(input.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toBe('Enter a contact')
  })
  it('uses tenant content and rejects unsafe links', () => {
    render(
      <FunnelLayout
        brand="Tenant brand"
        presentation={{
          helpHref: 'javascript:alert(1)',
          footer: {
            tagline: 'Tenant contact',
            details: 'Tenant region',
            socialLinks: [
              { label: 'Unsafe', url: 'javascript:alert(1)' },
              { label: 'Social', url: 'https://example.test' },
            ],
          },
        }}
      >
        <StepProgress
          current={1}
          labels={['Contact', 'Collection', 'Photos']}
        />
      </FunnelLayout>,
    )
    expect(screen.queryByText('Need help?')).toBeNull()
    expect(screen.queryByRole('link', { name: 'Unsafe' })).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Social' }).getAttribute('href'),
    ).toBe('https://example.test')
    expect(
      screen
        .getByText('Collection')
        .parentElement?.getAttribute('aria-current'),
    ).toBe('step')
  })
  it('provides labeled native radio and checkbox choices', () => {
    const select = vi.fn(),
      toggle = vi.fn()
    render(
      <>
        <ChoiceGroup
          name="single"
          label="Single"
          value=""
          required
          options={[{ value: 'a', label: 'A' }]}
          onChange={select}
        />
        <ChoiceGroup
          name="multi"
          label="Multiple"
          multiple
          value={['a']}
          options={[
            { value: 'a', label: 'B' },
            { value: 'b', label: 'C' },
          ]}
          onChange={toggle}
        />
      </>,
    )
    fireEvent.click(screen.getByLabelText('A'))
    expect(select).toHaveBeenCalledWith('a')
    fireEvent.click(screen.getByLabelText('C'))
    expect(toggle).toHaveBeenCalledWith(['a', 'b'])
    fireEvent.click(screen.getByLabelText('B'))
    expect(toggle).toHaveBeenCalledWith([])
  })
  it('allows retrying the same photo and blocks disabled drops', () => {
    const upload = vi.fn(),
      file = new File(['photo'], 'covers.png', { type: 'image/png' })
    const view = render(
      <UploadCard
        label="Photo one"
        description="Six covers"
        saved={false}
        onFile={upload}
      />,
    )
    fireEvent.change(
      screen.getByLabelText('Photo one', { selector: 'input' }),
      {
        target: { files: [file] },
      },
    )
    fireEvent.change(
      screen.getByLabelText('Photo one', { selector: 'input' }),
      {
        target: { files: [file] },
      },
    )
    expect(upload).toHaveBeenCalledTimes(2)
    view.rerender(
      <UploadCard
        label="Photo one"
        description="Six covers"
        saved
        disabled
        onFile={upload}
      />,
    )
    fireEvent.drop(screen.getByRole('region', { name: 'Photo one' }), {
      dataTransfer: { files: [file] },
    })
    expect(upload).toHaveBeenCalledTimes(2)
  })
})
