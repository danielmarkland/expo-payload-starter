import { DefaultNav } from '@payloadcms/next/rsc'
import type { ServerProps } from 'payload'

/** Preserve the native mobile shell, settings and logout around shared groups. */
export function NativeNavigation(props: ServerProps) {
  return <DefaultNav {...props} visibleEntities={{ collections: [], globals: [] }} />
}
