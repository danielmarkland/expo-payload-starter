'use client'
import { Button, Drawer, useModal } from '@payloadcms/ui'

/** The host supplies authorized archive jobs; this control owns no storage or auth. */
export function ThemeTransfer({
  busy,
  onExport,
  onImport,
}: {
  busy: boolean
  onExport: () => Promise<void>
  onImport: (file: File) => Promise<boolean>
}) {
  const { openModal, closeModal } = useModal()
  return (
    <section aria-label="Theme import and export">
      <h2>Theme</h2>
      <p>
        Reuse colors, typography, button styles and visual preferences. Theme
        packages contain no header, footer, navigation, branding, media or
        content.
      </p>
      <div className="admin-page-actions">
        <Button
          buttonStyle="secondary"
          disabled={busy}
          onClick={() => void onExport()}
        >
          Export Theme
        </Button>
        <Button
          buttonStyle="secondary"
          disabled={busy}
          onClick={() => openModal('import-theme')}
        >
          Import Theme
        </Button>
      </div>
      <Drawer slug="import-theme" title="Import Theme">
        <p>
          Upload an exported theme archive, then review the destination and
          confirm. Only visual settings will change; existing content and media
          stay intact.
        </p>
        <label>
          Theme Archive{' '}
          <input
            type="file"
            accept=".tar,application/x-tar"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file)
                void onImport(file).then((success) => {
                  if (success) closeModal('import-theme')
                })
            }}
          />
        </label>
        <Button
          buttonStyle="secondary"
          disabled={busy}
          onClick={() => closeModal('import-theme')}
        >
          Close
        </Button>
      </Drawer>
    </section>
  )
}
