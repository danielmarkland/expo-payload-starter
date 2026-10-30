'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ConfirmationModal,
  useModal,
  useForm,
  useFormModified,
} from '@payloadcms/ui'
import { flushSync } from 'react-dom'

type Entry = { modified: boolean; workflow?: boolean; discard: () => void }
const Context = createContext<Map<symbol, Entry> | null>(null)

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const entries = useRef(new Map<symbol, Entry>())
  const [destination, setDestination] = useState<string | null>(null)
  const { openModal, closeModal } = useModal()
  useEffect(() => {
    const navigate = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const link =
        event.target instanceof Element ? event.target.closest('a[href]') : null
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        link.getAttribute('href')?.startsWith('#')
      )
        return
      if (
        ![...entries.current.values()].some(
          (entry) => entry.workflow && entry.modified,
        )
      )
        return
      event.preventDefault()
      event.stopPropagation()
      setDestination(link.href)
      openModal('discard-workflow-navigation')
    }
    document.addEventListener('click', navigate, true)
    return () => document.removeEventListener('click', navigate, true)
  }, [openModal])
  return (
    <Context.Provider value={entries.current}>
      {children}
      <ConfirmationModal
        modalSlug="discard-workflow-navigation"
        heading="Leave This Page?"
        body="You have unsaved changes. Discard them and continue?"
        cancelLabel="Keep Editing"
        confirmLabel="Discard Changes"
        onCancel={() => {
          setDestination(null)
          closeModal('discard-workflow-navigation')
        }}
        onConfirm={() => {
          if (destination) {
            flushSync(() => entries.current.forEach((entry) => entry.discard()))
            window.location.assign(destination)
          }
        }}
      />
    </Context.Provider>
  )
}

export function useUnsavedChanges() {
  const entries = useContext(Context)
  return {
    modified: () =>
      Boolean(entries && [...entries.values()].some((entry) => entry.modified)),
    discard: () => entries?.forEach((entry) => entry.discard()),
  }
}

/** Custom workflow forms participate in scope switching and browser unloads. */
export function useUnsavedForm(modified: boolean) {
  const entries = useContext(Context)
  const token = useRef(Symbol('workflow-form'))
  const bypass = useRef(false)
  useEffect(() => {
    const key = token.current
    bypass.current = false
    entries?.set(key, {
      modified,
      workflow: true,
      discard: () => {
        bypass.current = true
        entries?.delete(key)
      },
    })
    const unload = (event: BeforeUnloadEvent) => {
      if (modified && !bypass.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', unload)
    return () => {
      entries?.delete(key)
      window.removeEventListener('beforeunload', unload)
    }
  }, [entries, modified])
}

/** Register inside the native form, which is outside the header's React subtree. */
export function NativeFormState() {
  const entries = useContext(Context)
  const token = useRef(Symbol('native-form'))
  const modified = useFormModified()
  const { setModified } = useForm()
  useEffect(() => {
    const key = token.current
    entries?.set(key, { modified, discard: () => setModified(false) })
    return () => {
      entries?.delete(key)
    }
  }, [entries, modified, setModified])
  return null
}
