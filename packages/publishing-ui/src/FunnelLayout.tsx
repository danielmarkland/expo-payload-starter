'use client'
import { useId, type ReactNode } from 'react'
import { getLinkIcon } from './linkIcons.js'
import { getSafeExternalHref } from '@danielmarkland/publishing-core/navigation'
import { Button } from './FunnelControls.js'

export type FunnelPresentation = {
  brandHref?: string | null
  branding?: { darkLogoUrl?: string | null; lightLogoUrl?: string | null }
  turnstileSiteKey?: string | null
  helpHref?: string | null
  footer?: {
    background?: 'page' | 'dark' | null
    tagline?: string | null
    details?: string | null
    copyrightOwner?: string | null
    socialLinks?: { label: string; url: string; icon?: string | null }[]
  }
}
export function FunnelLayout({
  brand,
  presentation,
  onHome,
  navigation,
  onHelp,
  children,
}: {
  brand: string
  presentation?: FunnelPresentation
  onHome?: () => void
  onHelp?: () => void
  navigation?: ReactNode
  children: ReactNode
}) {
  const footer = presentation?.footer
  const helpHref = getSafeExternalHref(presentation?.helpHref)
  const brandHref = getSafeExternalHref(presentation?.brandHref)
  const Brand = ({ dark = false }: { dark?: boolean }) => (
    <>
      {(['dark', 'light'] as const).map((mode) => {
        const src = getSafeExternalHref(
          mode === 'dark'
            ? presentation?.branding?.darkLogoUrl
            : presentation?.branding?.lightLogoUrl,
        )
        return (
          <span
            key={mode}
            className={`funnel-brand-${mode}${dark ? ' funnel-brand-fixed-dark' : ''}`}
          >
            {src && /^https?:/.test(src) ? (
              <img src={src} alt={brand} />
            ) : (
              brand
            )}
          </span>
        )
      })}
    </>
  )
  return (
    <div className="funnel-layout">
      <header className="funnel-layout-header">
        {brandHref ? (
          <a
            className="funnel-layout-brand"
            aria-label={brand}
            href={brandHref}
          >
            <Brand />
          </a>
        ) : (
          <button
            className="funnel-layout-brand"
            type="button"
            onClick={onHome}
          >
            <Brand />
          </button>
        )}
        <div className="funnel-layout-links">
          {navigation}
          {helpHref ? (
            <a
              className="funnel-layout-help"
              href={helpHref}
              onClick={
                onHelp
                  ? (event) => {
                      event.preventDefault()
                      onHelp()
                    }
                  : undefined
              }
            >
              Need help?
            </a>
          ) : null}
        </div>
      </header>
      <main className="funnel-layout-content">{children}</main>
      <footer
        className={`funnel-layout-footer funnel-footer-${footer?.background || 'dark'}`}
      >
        <div>
          <a className="funnel-layout-brand" href={brandHref || undefined}>
            <Brand dark={footer?.background !== 'page'} />
          </a>
          {helpHref ? (
            <p>
              <a
                href={helpHref}
                onClick={
                  onHelp
                    ? (event) => {
                        event.preventDefault()
                        onHelp()
                      }
                    : undefined
                }
              >
                Contact Us
              </a>
            </p>
          ) : null}
          {footer?.tagline ? <p>{footer.tagline}</p> : null}
          {footer?.socialLinks?.length ? (
            <nav aria-label="Social media">
              {footer.socialLinks.map((link) => {
                const href = getSafeExternalHref(link.url)
                if (!href) return null
                const Icon = getLinkIcon(link.icon)
                return (
                  <a
                    key={link.url}
                    href={href}
                    aria-label={link.label}
                    rel="noreferrer"
                  >
                    {Icon ? <Icon aria-hidden="true" /> : link.label}
                  </a>
                )
              })}
            </nav>
          ) : null}
        </div>
        <div className="funnel-layout-footer-details">
          {footer?.details ? <p>{footer.details}</p> : null}
          <p>
            © {new Date().getFullYear()} {footer?.copyrightOwner || brand}
          </p>
        </div>
      </footer>
    </div>
  )
}

type Option = { value: string; label: string }
type Common = {
  name: string
  label: string
  hint?: string
  options: readonly Option[]
  disabled?: boolean
  required?: boolean
  columns?: 1 | 2
}
type Choices = Common &
  (
    | { multiple: true; value: string[]; onChange: (value: string[]) => void }
    | { multiple?: false; value: string; onChange: (value: string) => void }
  )
export function ChoiceGroup(props: Choices) {
  const id = useId()
  return (
    <fieldset
      className={`funnel-choice-group funnel-choice-columns-${props.columns || 2}`}
      disabled={props.disabled}
      aria-describedby={props.hint ? `${id}-hint` : undefined}
    >
      <legend>{props.label}</legend>
      {props.hint ? <p id={`${id}-hint`}>{props.hint}</p> : null}
      <div>
        {props.options.map((option) => (
          <label className="funnel-choice" key={option.value}>
            <input
              type={props.multiple ? 'checkbox' : 'radio'}
              name={props.name}
              required={!props.multiple && props.required}
              value={option.value}
              checked={
                props.multiple
                  ? props.value.includes(option.value)
                  : props.value === option.value
              }
              onChange={(event) => {
                if (props.multiple)
                  props.onChange(
                    event.target.checked
                      ? [...props.value, option.value]
                      : props.value.filter((value) => value !== option.value),
                  )
                else props.onChange(option.value)
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function StepProgress({
  current,
  labels,
}: {
  current: number
  labels: readonly string[]
}) {
  return (
    <nav className="funnel-step-progress" aria-label="Submission progress">
      <p>
        Step {String(current + 1).padStart(2, '0')} of{' '}
        {String(labels.length).padStart(2, '0')}
      </p>
      <ol>
        {labels.map((label, index) => (
          <li
            key={label}
            aria-current={index === current ? 'step' : undefined}
            data-complete={index < current}
          >
            <span>{label}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function UploadCard({
  label,
  description,
  previewUrl,
  previewAlt,
  saved,
  disabled,
  onFile,
  children,
  accept = 'image/jpeg,image/png,image/webp',
}: {
  label: string
  description: string
  previewUrl?: string
  previewAlt?: string
  saved: boolean
  disabled?: boolean
  onFile: (file: File) => void
  children?: ReactNode
  accept?: string
}) {
  const id = useId()
  return (
    <section
      className="funnel-upload-card"
      aria-label={label}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files[0]
        if (file && !disabled) onFile(file)
      }}
    >
      <h2>{label}</h2>
      <p>{description}</p>
      {previewUrl ? (
        <img src={previewUrl} alt={previewAlt || label} />
      ) : (
        children
      )}
      <div className="funnel-upload-picker">
        <Button type="button" secondary tabIndex={-1} aria-hidden="true">
          {saved ? 'Replace photo' : 'Choose photo'}
        </Button>
        <input
          id={id}
          aria-label={label}
          aria-describedby={`${id}-status`}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFile(file)
            event.target.value = ''
          }}
        />
      </div>
      <p id={`${id}-status`} role="status">
        {saved
          ? 'Photo safely saved'
          : 'Drop a photo here, or choose one from your device.'}
      </p>
    </section>
  )
}
