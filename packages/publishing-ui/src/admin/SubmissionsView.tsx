'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  Button,
  Drawer,
  Pill,
  SelectInput,
  TextareaInput,
  TextInput,
  useModal,
} from '@payloadcms/ui'
import { RefreshCw, Save } from 'lucide-react'
import { AdminDate } from './AdminDate.js'
import { useUnsavedForm } from './UnsavedChanges.js'

type Submission = {
  id: string
  formId: string
  formVersion: number
  reference: string | null
  status: string
  revision: number
  data: Record<string, unknown>
  history: { message: string; status?: string; created_at?: string }[]
}
type Definition = {
  id: string
  version: number
  title: string
  labels?: Record<string, string>
  statuses: string[]
  emailField?: string
}

/** No persistence or domain policy: the adapter loads versioned definitions and reviews. */
export function SubmissionsView<T extends Submission>({
  load,
  review,
  renderDetails,
}: {
  load: (page: number) => Promise<{ items: T[]; forms: Definition[] }>
  review: (item: T, status: string, message: string) => Promise<unknown>
  renderDetails: (item: T) => ReactNode
}) {
  const { openModal, closeModal, modalState } = useModal()
  const [items, setItems] = useState<T[]>([])
  const [forms, setForms] = useState<Definition[]>([])
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<T | null>(null)
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const definition = forms.find(
    (form) =>
      form.id === selected?.formId && form.version === selected.formVersion,
  )
  useUnsavedForm(
    Boolean(modalState['submission-review']?.isOpen) &&
      Boolean(selected && (message || status !== selected.status)),
  )
  async function refresh() {
    setBusy(true)
    setError('')
    try {
      const result = await load(page)
      setItems(result.items)
      setForms(result.forms)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Could not load submissions.',
      )
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => {
    let active = true
    setSelected(null)
    setItems([])
    setError('')
    setBusy(true)
    void load(page)
      .then((result) => {
        if (active) {
          setItems(result.items)
          setForms(result.forms)
        }
      })
      .catch((error) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : 'Could not load submissions.',
          )
      })
      .finally(() => {
        if (active) setBusy(false)
      })
    return () => {
      active = false
    }
  }, [load, page])
  const filtered = items.filter((item) =>
    `${item.formId} ${item.reference ?? ''} ${item.status}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  return (
    <section className="submissions-view">
      <header className="admin-page-header">
        <h1>Submissions</h1>
        <Button
          buttonStyle="secondary"
          icon={<RefreshCw size={16} aria-hidden />}
          disabled={busy}
          onClick={() => void refresh()}
        >
          Refresh
        </Button>
      </header>
      {error && <p role="alert">{error}</p>}
      <TextInput
        path="submission-page-filter"
        label="Filter This Page by Form, Reference or Status"
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setQuery(event.target.value)
        }
      />
      {filtered.length ? (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Form</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.reference || item.id}</td>
                  <td>
                    {forms.find(
                      (form) =>
                        form.id === item.formId &&
                        form.version === item.formVersion,
                    )?.title || item.formId}{' '}
                    · v{item.formVersion}
                  </td>
                  <td>
                    <Pill>{item.status}</Pill>
                  </td>
                  <td>
                    <Button
                      buttonStyle="secondary"
                      size="small"
                      onClick={() => {
                        setSelected(item)
                        setStatus(item.status)
                        setMessage('')
                        setError('')
                        openModal('submission-review')
                      }}
                    >
                      Review Submission
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>{busy ? 'Loading Submissions…' : 'No submissions on this page.'}</p>
      )}
      <div className="page-actions">
        <Button
          buttonStyle="secondary"
          disabled={busy || page === 1}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          buttonStyle="secondary"
          disabled={busy || items.length < 25}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </Button>
      </div>
      <Drawer slug="submission-review" title="Review Submission">
        {selected && (
          <div className="submissions-view__review">
            <h2>
              {definition?.title ?? selected.formId} · {selected.reference}
            </h2>
            <p>
              <Pill>{selected.status}</Pill> · Form Version{' '}
              {selected.formVersion}
            </p>
            <dl>
              {Object.entries(selected.data).map(([key, value]) => (
                <div key={key}>
                  <dt>{definition?.labels?.[key] ?? key}</dt>
                  <dd>
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </dd>
                </div>
              ))}
            </dl>
            {renderDetails(selected)}
            <h3>Review History</h3>
            <ol>
              {selected.history.map((entry, index) => (
                <li key={index}>
                  {entry.status && <Pill>{entry.status}</Pill>} {entry.message}{' '}
                  {entry.created_at && <AdminDate value={entry.created_at} />}
                </li>
              ))}
            </ol>
            {definition?.emailField && (
              <p>
                Save Review updates the submission page. To send an email, reply
                from the site inbox.
              </p>
            )}
            {error && <p role="alert">{error}</p>}
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setBusy(true)
                setError('')
                void review(selected, status, message)
                  .then(async () => {
                    setSelected(null)
                    setMessage('')
                    closeModal('submission-review')
                    await refresh()
                  })
                  .catch((error) =>
                    setError(
                      error instanceof Error ? error.message : 'Review failed.',
                    ),
                  )
                  .finally(() => setBusy(false))
              }}
            >
              <SelectInput
                name="review-status"
                path="review-status"
                label="Status"
                isClearable={false}
                value={status}
                options={(definition?.statuses ?? [selected.status]).map(
                  (value) => ({ label: value.replaceAll('_', ' '), value }),
                )}
                onChange={(option) => {
                  if (option && 'value' in option)
                    setStatus(String(option.value))
                }}
              />
              <TextareaInput
                path="review-message"
                label="Message Visible to Submitter"
                value={message}
                required
                onChange={(event) => setMessage(event.target.value)}
              />
              <div className="page-actions">
                <Button
                  buttonStyle="secondary"
                  disabled={busy}
                  onClick={() => closeModal('submission-review')}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  icon={<Save size={16} aria-hidden />}
                  disabled={busy || !message.trim()}
                >
                  Save Review
                </Button>
              </div>
            </form>
          </div>
        )}
      </Drawer>
    </section>
  )
}
