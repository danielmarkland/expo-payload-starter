import { createContext, useContext, useState, type ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  UnsavedChangesProvider,
  WorkflowDrawer,
  useUnsavedForm,
} from './UnsavedChanges.js'
type Modals = {
  modalState: Record<string, { isOpen: boolean }>
  openModal: (slug: string) => void
  closeModal: (slug: string) => void
}
const ModalContext = createContext<Modals>(null!)
const close = vi.hoisted(() => vi.fn())
vi.mock('@payloadcms/ui', () => ({
  useModal: () => useContext(ModalContext),
  useForm: () => ({ setModified: () => {} }),
  useFormModified: () => false,
  Drawer: ({ slug, children }: { slug: string; children: ReactNode }) => {
    const api = useContext(ModalContext)
    return api.modalState[slug]?.isOpen ? (
      <div
        id={slug}
        className="drawer"
        onKeyDown={(event) => {
          if (event.key === 'Escape') api.closeModal(slug)
        }}
      >
        <button
          id={`close-drawer__${slug}`}
          onClick={() => api.closeModal(slug)}
        >
          Close
        </button>
        {children}
      </div>
    ) : null
  },
  ConfirmationModal: ({
    modalSlug,
    heading,
    cancelLabel,
    confirmLabel,
    onCancel,
    onConfirm,
  }: {
    modalSlug: string
    heading: string
    cancelLabel: string
    confirmLabel: string
    onCancel: () => void
    onConfirm: () => void
  }) => {
    const api = useContext(ModalContext)
    return api.modalState[modalSlug]?.isOpen ? (
      <div
        role="dialog"
        aria-label={heading}
        onKeyDown={(event) => {
          if (event.key === 'Escape') api.closeModal(modalSlug)
        }}
      >
        <button onClick={onCancel}>{cancelLabel}</button>
        <button onClick={onConfirm}>{confirmLabel}</button>
      </div>
    ) : null
  },
}))
function Modals({ children }: { children: ReactNode }) {
  const [modalState, setState] = useState({
    settings: { isOpen: true },
  } as Modals['modalState'])
  return (
    <ModalContext.Provider
      value={{
        modalState,
        openModal: (slug) =>
          setState((state) => ({ ...state, [slug]: { isOpen: true } })),
        closeModal: (slug) => {
          close(slug)
          setState((state) => ({ ...state, [slug]: { isOpen: false } }))
        },
      }}
    >
      <UnsavedChangesProvider>{children}</UnsavedChangesProvider>
    </ModalContext.Provider>
  )
}
function ChildForm() {
  const [value, setValue] = useState('')
  useUnsavedForm(Boolean(value))
  return (
    <input
      aria-label="Draft"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}
afterEach(() => {
  cleanup()
  close.mockClear()
})
it('guards native close controls for dirty children and preserves edits when cancelled', () => {
  render(
    <Modals>
      <WorkflowDrawer slug="settings" title="Settings">
        <ChildForm />
      </WorkflowDrawer>
    </Modals>,
  )
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft' }), {
    target: { value: 'Unsaved draft' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Close', exact: true }))
  expect(close).not.toHaveBeenCalledWith('settings')
  fireEvent.click(screen.getByRole('button', { name: 'Keep Editing' }))
  expect(
    (screen.getByRole('textbox', { name: 'Draft' }) as HTMLInputElement).value,
  ).toBe('Unsaved draft')
  fireEvent.click(screen.getByRole('button', { name: 'Close', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }))
  expect(close).toHaveBeenCalledWith('settings')
  expect(screen.queryByRole('textbox', { name: 'Draft' })).toBeNull()
})
function ParentForm() {
  const [value, setValue] = useState('')
  const { openModal } = useContext(ModalContext)
  return (
    <>
      <button onClick={() => openModal('settings')}>Reopen</button>
      <WorkflowDrawer
        slug="settings"
        title="Settings"
        modified={Boolean(value)}
        onDiscard={() => setValue('')}
      >
        <input
          aria-label="Draft"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </WorkflowDrawer>
    </>
  )
}
it('guards Escape and resets parent-held fields only after explicit discard', () => {
  render(
    <Modals>
      <ParentForm />
    </Modals>,
  )
  const input = screen.getByRole('textbox', { name: 'Draft' })
  fireEvent.change(input, { target: { value: 'Unsaved draft' } })
  fireEvent.keyDown(input, { key: 'Escape', keyCode: 27 })
  expect(close).not.toHaveBeenCalledWith('settings')
  fireEvent.keyDown(screen.getByRole('button', { name: 'Keep Editing' }), {
    key: 'Escape',
    keyCode: 27,
  })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect((input as HTMLInputElement).value).toBe('Unsaved draft')
  fireEvent.keyDown(input, { key: 'Escape', keyCode: 27 })
  fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }))
  fireEvent.click(screen.getByRole('button', { name: 'Reopen' }))
  expect(
    (screen.getByRole('textbox', { name: 'Draft' }) as HTMLInputElement).value,
  ).toBe('')
})
function OtherForm() {
  useUnsavedForm(true)
  return null
}
it('does not discard unrelated page edits when closing a clean drawer', () => {
  render(
    <Modals>
      <OtherForm />
      <WorkflowDrawer slug="settings" title="Settings">
        <p>Read-only</p>
      </WorkflowDrawer>
    </Modals>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Close', exact: true }))
  expect(close).toHaveBeenCalledWith('settings')
  expect(screen.queryByRole('dialog')).toBeNull()
})
