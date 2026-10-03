import Link from 'next/link'
import { createElement, type ReactNode } from 'react'

import { getLinkIcon } from '@/lib/headerNavigationIcons'
import { getNavigationHref, type LinkData } from '@/lib/navigation'
import { buttonClassName, type ButtonVariant } from '@danielmarkland/publishing-core/buttonVariants'

export type LinkPresentation = LinkData

export function LinkLabel({
  icon,
  iconOnly,
  iconPosition,
  label,
}: Pick<LinkPresentation, 'icon' | 'iconOnly' | 'iconPosition' | 'label'>) {
  const Icon = getLinkIcon(icon)
  const iconElement = Icon
    ? createElement(Icon, { 'aria-hidden': true, className: 'link-icon' })
    : null
  const hideLabel = Boolean(Icon && iconOnly)

  return (
    <>
      {Icon && iconPosition !== 'right' ? iconElement : null}
      {hideLabel ? <span className="sr-only">{label}</span> : label}
      {Icon && iconPosition === 'right' ? iconElement : null}
    </>
  )
}

export function ContentLink({
  children,
  className,
  link,
}: {
  children?: ReactNode
  className?: string
  link: LinkPresentation
}) {
  const href = getNavigationHref(link)
  if (!href) return null

  return (
    <Link
      aria-label={link.iconOnly ? link.label || undefined : undefined}
      className={className}
      href={href}
      rel={link.newTab ? 'noreferrer' : undefined}
      target={link.newTab ? '_blank' : undefined}
    >
      {children ?? <LinkLabel {...link} />}
      {link.newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </Link>
  )
}

export function ActionLink({
  action,
  className,
  fallbackVariant = 'primary-filled',
}: {
  action?: LinkPresentation | null
  className?: string
  fallbackVariant?: ButtonVariant
}) {
  if (!action?.label) return null
  const classes = [buttonClassName(action.variant, fallbackVariant), className]
    .filter(Boolean)
    .join(' ')
  return <ContentLink className={classes} link={action} />
}
