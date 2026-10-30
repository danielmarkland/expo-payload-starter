import { afterEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ButtonHTMLAttributes,
} from 'react'
import { FormsView } from './FormsView.js'
import { SubmissionsView } from './SubmissionsView.js'

vi.mock('@payloadcms/ui', () => ({
  Button: ({
    children,
    buttonStyle: _style,
    icon: _icon,
    size: _size,
    el,
    to,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    buttonStyle?: string
    icon?: ReactNode
    size?: string
    el?: string
    to?: string
  }) =>
    el ? <a href={to}>{children}</a> : <button {...props}>{children}</button>,
  Pill: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  TextInput: ({
    path,
    label,
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & {
    path: string
    label: string
  }) => (
    <label>
      {label}
      <input id={path} {...props} />
    </label>
  ),
  TextareaInput: ({
    path,
    label,
    ...props
  }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    path: string
    label: string
  }) => (
    <label>
      {label}
      <textarea id={path} {...props} />
    </label>
  ),
  CheckboxInput: ({
    label,
    checked,
    onToggle,
  }: {
    label: string
    checked: boolean
    onToggle: () => void
  }) => (
    <label>
      {label}
      <input type="checkbox" checked={checked} onChange={onToggle} />
    </label>
  ),
  SelectInput: ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string
    value: string
    options: { label: string; value: string }[]
    onChange: (option: { value: string }) => void
  }) => (
    <label>
      {label}
      <select
        value={value}
        onChange={(event) => onChange({ value: event.target.value })}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
  Drawer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ConfirmationModal: () => null,
  useModal: () => ({
    openModal: () => {},
    closeModal: () => {},
    modalState: {},
  }),
}))
afterEach(cleanup)

it('retains advanced definition properties and installs a new immutable version', async () => {
  const form = {
    id: 'request',
    title: 'Request',
    version: 2,
    statuses: ['submitted'],
    labels: { answer: 'Your Answer' },
    attachments: { count: 3 },
  }
  const configure = vi.fn(async () => {})
  render(
    <FormsView
      initial={{ enabled: true, forms: [form] }}
      configure={configure}
      createDefinition={(id, title) => ({ ...form, id, title, version: 1 })}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Edit Definition' }))
  const editor = screen.getByLabelText(
    'Versioned Definition (JSON)',
  ) as HTMLTextAreaElement
  expect(JSON.parse(editor.value)).toEqual({ ...form, version: 3 })
  fireEvent.change(editor, { target: { value: '{invalid' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Definition' }))
  expect(configure).not.toHaveBeenCalled()
  fireEvent.change(editor, {
    target: { value: JSON.stringify({ ...form, version: 3 }) },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save Definition' }))
  await waitFor(() =>
    expect(configure).toHaveBeenCalledWith(true, [{ ...form, version: 3 }]),
  )
})

it('reviews using the submission’s pinned definition and original revision', async () => {
  const item = {
    id: 'one',
    formId: 'request',
    formVersion: 1,
    reference: 'R-1',
    status: 'submitted',
    revision: 4,
    data: { answer: 'Original' },
    history: [],
  }
  const load = vi.fn(async () => ({
    items: [item],
    forms: [
      {
        id: 'request',
        version: 1,
        title: 'Original Form',
        labels: { answer: 'Original Label' },
        statuses: ['submitted', 'accepted'],
      },
      {
        id: 'request',
        version: 2,
        title: 'New Form',
        statuses: ['submitted', 'confirmed'],
      },
    ],
  }))
  const review = vi.fn(async () => {})
  render(
    <SubmissionsView load={load} review={review} renderDetails={() => null} />,
  )
  fireEvent.click(
    await screen.findByRole('button', { name: 'Review Submission' }),
  )
  expect(screen.getByText('Original Label')).toBeTruthy()
  expect(screen.queryByRole('option', { name: 'confirmed' })).toBeNull()
  fireEvent.change(screen.getByLabelText('Status'), {
    target: { value: 'accepted' },
  })
  fireEvent.change(screen.getByLabelText('Message Visible to Submitter'), {
    target: { value: 'Reviewed' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save Review' }))
  await waitFor(() =>
    expect(review).toHaveBeenCalledWith(item, 'accepted', 'Reviewed'),
  )
})
