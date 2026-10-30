import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  NativeFormState,
  UnsavedChangesProvider,
  useUnsavedChanges,
  useUnsavedForm,
} from './UnsavedChanges.js'

const native = vi.hoisted(() => ({
  modified: true,
  setModified: vi.fn(),
  openModal: vi.fn(),
}))
vi.mock('@payloadcms/ui', () => ({
  useForm: () => ({ setModified: native.setModified }),
  useFormModified: () => native.modified,
  useModal: () => ({ openModal: native.openModal, closeModal: () => {} }),
  ConfirmationModal: ({ children }: { children?: ReactNode }) =>
    children ?? null,
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
function Probe() {
  const state = useUnsavedChanges()
  return (
    <>
      <button onClick={() => state.discard()}>Discard</button>
      <button
        onClick={() => {
          if (state.modified()) native.openModal('modified')
        }}
      >
        Check
      </button>
    </>
  )
}
it('hoists native form modifications to the header and clears native dirty state when discarded', () => {
  render(
    <UnsavedChangesProvider>
      <NativeFormState />
      <Probe />
    </UnsavedChangesProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Check' }))
  expect(native.openModal).toHaveBeenCalledWith('modified')
  fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
  expect(native.setModified).toHaveBeenCalledWith(false)
})
function Workflow({ modified }: { modified: boolean }) {
  useUnsavedForm(modified)
  return <a href="/admin/tenant">Overview</a>
}
it('protects dirty workflow navigation and browser unload, then releases the guard on unmount', () => {
  const view = render(
    <UnsavedChangesProvider>
      <Workflow modified />
    </UnsavedChangesProvider>,
  )
  expect(fireEvent.click(screen.getByRole('link', { name: 'Overview' }))).toBe(
    false,
  )
  expect(native.openModal).toHaveBeenCalledWith('discard-workflow-navigation')
  const unload = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(unload)
  expect(unload.defaultPrevented).toBe(true)
  view.unmount()
  const clean = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(clean)
  expect(clean.defaultPrevented).toBe(false)
})
