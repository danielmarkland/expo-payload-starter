'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
  type SyntheticEvent,
} from 'react'
import {
  ConfirmationModal,
  Drawer as NativeDrawer,
  useModal,
  useForm,
  useFormModified,
} from '@payloadcms/ui'
import { flushSync } from 'react-dom'

type Entry = {
  modified: boolean
  workflow?: boolean
  drawer?: string
  discard: () => void
}
const DrawerScope = createContext<string | undefined>(undefined)
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
  const drawer = useContext(DrawerScope)
  const token = useRef(Symbol('workflow-form'))
  const bypass = useRef(false)
  useEffect(() => {
    const key = token.current
    bypass.current = false
    entries?.set(key, {
      modified,
      workflow: true,
      drawer,
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
  }, [entries, modified, drawer])
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

/** Keep Payload's native drawer and modal behavior, guarding destructive dismissals. */
export function WorkflowDrawer({
  modified = false,
  onDiscard,
  children,
  ...props
}: ComponentProps<typeof NativeDrawer> & {
  modified?: boolean
  onDiscard?: () => void
}) {
  const entries = useContext(Context)
  const { openModal, closeModal, modalState } = useModal()
  const confirmation = `discard-workflow-drawer-${props.slug}`
  function requestClose(event: SyntheticEvent) {
    if (
      !modified &&
      ![...(entries?.values() ?? [])].some(
        (entry) =>
          entry.workflow && entry.drawer === props.slug && entry.modified,
      )
    )
      return
    event.preventDefault()
    event.stopPropagation()
    openModal(confirmation)
  }
  return (
    <DrawerScope.Provider value={props.slug}>
      <div
        onClickCapture={(event) => {
          const button =
            event.target instanceof Element
              ? event.target.closest('button')
              : null
          if (button?.id === `close-drawer__${props.slug}`) requestClose(event)
        }}
        onKeyDownCapture={(event) => {
          const owner =
            event.target instanceof Element
              ? event.target.closest('.drawer')
              : null
          if (
            event.key === 'Escape' &&
            owner?.id === props.slug &&
            !modalState[confirmation]?.isOpen
          )
            requestClose(event)
        }}
      >
        <NativeDrawer {...props}>{children}</NativeDrawer>
        <ConfirmationModal
          modalSlug={confirmation}
          heading="Discard Unsaved Changes?"
          body="Close this drawer and discard changes that have not been saved?"
          cancelLabel="Keep Editing"
          confirmLabel="Discard Changes"
          onCancel={() => closeModal(confirmation)}
          onConfirm={() => {
            closeModal(confirmation)
            onDiscard?.()
            closeModal(props.slug)
          }}
        />
      </div>
    </DrawerScope.Provider>
  )
}
