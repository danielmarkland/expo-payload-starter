'use client'
import { AdminFieldGrid } from './AdminFieldGrid.js'

import { useState, type ChangeEvent } from 'react'
import {
  Button,
  CheckboxInput,
  ConfirmationModal,
  Pill,
  TextInput,
  TextareaInput,
  useModal,
} from '@payloadcms/ui'
import { Save } from 'lucide-react'
import { PageActions } from './PageActions.js'
import { useUnsavedForm, WorkflowDrawer as Drawer } from './UnsavedChanges.js'

type Definition = {
  id: string
  title: string
  version: number
  statuses: string[]
}

/** Host adapters retain validation, immutable versions, policy and persistence. */
export function FormsView<T extends Definition>({
  initial,
  configure,
  createDefinition,
  documentationURL,
}: {
  initial: { enabled: boolean; forms: T[] }
  configure: (enabled: boolean, definitions: T[]) => Promise<void>
  createDefinition: (id: string, title: string) => T
  documentationURL?: string
}) {
  const { openModal, closeModal, modalState } = useModal()
  const [enabled, setEnabled] = useState(initial.enabled)
  const [forms, setForms] = useState(() => [
    ...new Map(initial.forms.map((form) => [form.id, form])).values(),
  ])
  const [id, setID] = useState('')
  const [title, setTitle] = useState('')
  const [definition, setDefinition] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [savedDefinition, setSavedDefinition] = useState('')
  const editorModified = editing
    ? definition !== savedDefinition
    : Boolean(id || title)
  useUnsavedForm(Boolean(modalState['form-editor']?.isOpen) && editorModified)

  async function save(nextEnabled: boolean, nextForms: T[], drawer: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await configure(nextEnabled, nextForms)
      setEnabled(nextEnabled)
      setForms(nextForms)
      setMessage('Forms settings saved.')
      closeModal(drawer)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save forms.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="forms-view">
      <header className="admin-page-header">
        <div>
          <h1>Forms</h1>
          <p className="admin-page-header__hint">
            Manage your forms and the submissions they collect.
          </p>
        </div>
        <PageActions>
          {enabled && (
            <Button el="link" to="/admin/submissions" buttonStyle="secondary">
              Open Submissions
            </Button>
          )}
          <Button
            buttonStyle="secondary"
            onClick={() => {
              setError('')
              openModal('form-settings')
            }}
          >
            Form Settings
          </Button>
          <Button
            icon="plus"
            onClick={() => {
              setID('')
              setTitle('')
              setEditing(null)
              setDefinition('')
              setSavedDefinition('')
              setError('')
              openModal('form-editor')
            }}
          >
            New Form
          </Button>
        </PageActions>
      </header>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      <section className="forms-view__status" aria-label="Submission Status">
        <div>
          <h2>Submissions</h2>
          <p>
            {enabled
              ? 'New submissions are being accepted.'
              : 'New submissions are paused. Existing submissions remain available.'}
          </p>
        </div>
        <Pill size="small">{enabled ? 'Enabled' : 'Paused'}</Pill>
      </section>
      {!forms.length ? (
        <section className="forms-view__empty" aria-label="Forms List">
          <h2>No forms yet</h2>
          <p>Create a form to start collecting submissions from your app.</p>
        </section>
      ) : (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Form</th>
                <th>Version</th>
                <th>Review Statuses</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.id}>
                  <td>
                    {form.title}
                    <br />
                    <code>{form.id}</code>
                  </td>
                  <td>{form.version}</td>
                  <td>{form.statuses.join(', ')}</td>
                  <td>
                    <Button
                      buttonStyle="secondary"
                      size="small"
                      margin={false}
                      onClick={() => {
                        setSavedDefinition(
                          JSON.stringify(
                            { ...form, version: form.version + 1 },
                            null,
                            2,
                          ),
                        )
                        setEditing(form.id)
                        setID(form.id)
                        setTitle(form.title)
                        setDefinition(
                          JSON.stringify(
                            { ...form, version: form.version + 1 },
                            null,
                            2,
                          ),
                        )
                        setError('')
                        openModal('form-editor')
                      }}
                    >
                      Edit Definition
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {documentationURL && (
        <details className="forms-view__advanced">
          <summary>Advanced</summary>
          <p>
            Connect your app to forms and submissions using the{' '}
            <a href={documentationURL}>API Documentation</a>.
          </p>
        </details>
      )}
      <Drawer
        slug="form-editor"
        modified={editorModified}
        onDiscard={() => {
          setDefinition(savedDefinition)
          setID('')
          setTitle('')
        }}
        title={editing ? 'New Form Version' : 'New Form'}
      >
        <div className="forms-view__drawer">
          <p>
            Definitions are immutable. Saving an edit installs a new version;
            existing submissions retain their original version.
          </p>
          {error && <p role="alert">{error}</p>}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              let next: T
              try {
                next = editing
                  ? (JSON.parse(definition) as T)
                  : createDefinition(id, title)
                if (editing && next.id !== editing)
                  throw new Error('A new version must keep the form ID.')
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : 'Enter a valid definition.',
                )
                return
              }
              void save(
                enabled,
                [...forms.filter((form) => form.id !== next.id), next],
                'form-editor',
              )
            }}
          >
            {editing ? (
              <TextareaInput
                path="form-definition"
                label="Versioned Definition (JSON)"
                rows={18}
                value={definition}
                onChange={(event) => setDefinition(event.target.value)}
              />
            ) : (
              <>
                <AdminFieldGrid>
                  <TextInput
                    path="form-id"
                    label="Form ID"
                    required
                    value={id}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setID(event.target.value)
                    }
                  />
                  <TextInput
                    path="form-title"
                    label="Title"
                    required
                    value={title}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setTitle(event.target.value)
                    }
                  />
                </AdminFieldGrid>
                <p>
                  New forms start at version 1 with the submitted review status.
                  Edit the definition afterward to configure schemas, policy
                  fields, attachments and email copy.
                </p>
              </>
            )}
            <PageActions>
              <Button
                buttonStyle="secondary"
                disabled={busy}
                id="close-drawer__form-editor"
                onClick={() => closeModal('form-editor')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                icon={<Save size={16} aria-hidden />}
              >
                Save Definition
              </Button>
            </PageActions>
          </form>
        </div>
      </Drawer>
      <Drawer slug="form-settings" title="Form Settings">
        <div className="forms-view__drawer">
          <p>
            Pausing submissions preserves definitions, submissions, attachments
            and review history.
          </p>
          {error && <p role="alert">{error}</p>}
          <CheckboxInput
            name="submissions-enabled"
            label="Enable Submissions"
            checked={enabled}
            onToggle={() =>
              enabled
                ? openModal('pause-submissions')
                : void save(true, forms, 'form-settings')
            }
          />
          <Button
            buttonStyle="secondary"
            onClick={() => closeModal('form-settings')}
          >
            Close
          </Button>
        </div>
      </Drawer>
      <ConfirmationModal
        modalSlug="pause-submissions"
        className="admin-danger-confirmation"
        heading="Pause Submissions?"
        body="Customers will be unable to submit forms in this environment. Existing submissions and form versions remain available. Enable submissions to restore access."
        cancelLabel="Keep Enabled"
        confirmLabel="Pause Submissions"
        onCancel={() => closeModal('pause-submissions')}
        onConfirm={() => save(false, forms, 'pause-submissions')}
      />
    </section>
  )
}
