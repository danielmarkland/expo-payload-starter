'use client'
import {
  createElement as h,
  useId,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type ChangeEventHandler,
} from 'react'
export function Field({
  label,
  hint,
  error,
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  children?: ReactNode
}) {
  const id = useId()
  const help = `${id}-help`
  return h(
    'div',
    { className: 'funnel-field' },
    h('label', { htmlFor: props.id || id }, label),
    children ||
      h('input', {
        ...props,
        id: props.id || id,
        'aria-invalid': !!error,
        'aria-describedby': hint || error ? help : undefined,
      }),
    hint || error
      ? h(
          'small',
          { id: help, role: error ? 'alert' : undefined },
          error || hint,
        )
      : null,
  )
}
export function Button({
  secondary,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return h('button', {
    ...props,
    className: `button button-${secondary ? 'secondary-outline' : 'primary-filled'} ${className}`,
  })
}
export function Progress({
  current,
  labels,
}: {
  current: number
  labels: string[]
}) {
  return h(
    'nav',
    { 'aria-label': 'Submission progress', className: 'funnel-progress' },
    h(
      'ol',
      null,
      ...labels.map((label, index) =>
        h(
          'li',
          {
            key: label,
            'aria-current': index === current ? 'step' : undefined,
            'data-complete': index < current,
          },
          label,
        ),
      ),
    ),
  )
}
export function Choice({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return h(
    'label',
    { className: 'funnel-choice' },
    h('input', { type: 'checkbox', ...props }),
    h('span', null, label),
  )
}
export function PhotoInput({
  slot,
  complete,
  disabled,
  onChange,
}: {
  slot: number
  complete: boolean
  disabled?: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
}) {
  return h(
    'div',
    { className: 'funnel-photo' },
    h('label', { htmlFor: `photo-${slot}` }, `Photo ${slot}: six front covers`),
    h(
      'div',
      { className: 'funnel-photo-grid', 'aria-hidden': true },
      ...Array.from({ length: 6 }, (_, i) =>
        h('span', { key: i }, (slot - 1) * 6 + i + 1),
      ),
    ),
    h('input', {
      id: `photo-${slot}`,
      type: 'file',
      accept: 'image/jpeg,image/png,image/webp',
      disabled,
      onChange,
    }),
    h(
      'small',
      { role: 'status' },
      complete
        ? 'Photo safely saved'
        : 'Two columns of three. JPEG, PNG or WebP; 10 MiB maximum.',
    ),
  )
}
