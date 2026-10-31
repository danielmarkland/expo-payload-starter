import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ButtonHTMLAttributes } from 'react'
import type { ArrayFieldClient } from 'payload'

const state = vi.hoisted(() => ({
  data: {} as Record<string, unknown>,
  reset: vi.fn(),
  modified: vi.fn(),
  processing: vi.fn(),
}))
vi.mock('@payloadcms/ui', () => ({
  useForm: () => ({
    getData: () => state.data,
    getDataByPath: (path: string) => state.data[path],
    reset: state.reset,
    setModified: state.modified,
    setProcessing: state.processing,
  }),
  useFormFields: () => undefined,
  useField: () => ({ disabled: false }),
  useModal: () => ({ openModal: vi.fn() }),
  ConfirmationModal: () => null,
  Button: ({
    children,
    margin: _margin,
    buttonStyle: _style,
    icon: _icon,
    extraButtonProps,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    margin?: boolean
    buttonStyle?: string
    icon?: string
    extraButtonProps?: Record<string, unknown>
  }) => (
    <button {...props} {...extraButtonProps}>
      {children}
    </button>
  ),
  RenderFields: ({
    parentPath,
    readOnly,
  }: {
    parentPath: string
    readOnly: boolean
  }) => (
    <div
      aria-label="Native Settings Fields"
      data-path={parentPath}
      data-read-only={readOnly}
    >
      <button className="btn" type="button">
        Native Field Control
      </button>
    </div>
  ),
}))
import { FooterEditor } from './FooterEditor.js'

const field = {
  name: 'areas',
  type: 'array',
  fields: [
    {
      name: 'columns',
      type: 'array',
      fields: [{ name: 'blocks', type: 'blocks', blocks: [] }],
    },
  ],
} as unknown as ArrayFieldClient
const editor = (readOnly = false) => (
  <FooterEditor
    field={field}
    path="areas"
    schemaPath="footer.areas"
    readOnly={readOnly}
  />
)
beforeEach(() => {
  state.data = { title: 'Footer', areas: [] }
  state.reset.mockReset().mockImplementation(async (data) => {
    state.data = data
  })
  state.modified.mockReset()
  state.processing.mockReset()
})
afterEach(cleanup)

it('keeps the empty layout focused without an unused settings panel or preview toggle', () => {
  render(editor())
  expect(
    screen.getByRole('heading', { name: 'No content areas yet' }),
  ).toBeTruthy()
  expect(
    screen.queryByRole('complementary', { name: 'Footer component settings' }),
  ).toBeNull()
  expect(screen.queryByRole('button', { name: 'Mobile Layout' })).toBeNull()
  expect(
    screen.getAllByRole('button', { name: 'Add Content Area' }),
  ).toHaveLength(1)
  expect(state.reset).not.toHaveBeenCalled()
})

it('adds an unsaved content area and opens native settings without submitting the document', async () => {
  const submit = vi.fn((event) => event.preventDefault())
  render(<form onSubmit={submit}>{editor()}</form>)
  fireEvent.click(screen.getByRole('button', { name: 'Add Content Area' }))
  await screen.findByRole('heading', { name: 'Content area settings' })
  expect(state.data.title).toBe('Footer')
  expect(state.modified).toHaveBeenCalledWith(true)
  expect(
    screen.getByLabelText('Native Settings Fields').getAttribute('data-path'),
  ).toBe('areas.0')
  expect(
    screen.queryByRole('heading', { name: 'No content areas yet' }),
  ).toBeNull()
  expect(screen.getByRole('button', { name: 'Mobile Layout' })).toBeTruthy()
  expect(submit).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Mobile Layout' }))
  expect(
    screen
      .getByRole('button', { name: 'Desktop Layout' })
      .getAttribute('aria-pressed'),
  ).toBe('true')
})

it('preserves read-only field controls and blocks structural edits', async () => {
  state.data.areas = [
    { id: 'area', title: 'Existing', columns: [{ id: 'column', blocks: [] }] },
  ]
  render(editor(true))
  expect(
    (
      screen.getByRole('button', {
        name: 'Add Content Area',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Existing' }))
  await waitFor(() =>
    expect(
      screen
        .getByLabelText('Native Settings Fields')
        .getAttribute('data-read-only'),
    ).toBe('true'),
  )
  expect(state.reset).not.toHaveBeenCalled()
})
