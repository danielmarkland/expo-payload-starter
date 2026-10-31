'use client'

import { GroupField, useDocumentInfo, useOperation } from '@payloadcms/ui'
import { getFieldPaths, getFieldPermissions } from 'payload/shared'
import type {
  ClientField,
  GroupFieldClient,
  UIFieldClientProps,
  SanitizedFieldPermissions,
} from 'payload'

type Section = 'Design' | 'Typography' | 'Colors'

/** Locate the canonical group without changing its schema or stored paths. */
export function findTheme(
  fields: ClientField[],
  parentSchemaPath: string,
  parentIndexPath = '',
):
  | { field: GroupFieldClient; schemaPath: string; parentSchemaPath: string }
  | undefined {
  for (const [index, field] of fields.entries()) {
    const paths = getFieldPaths({
      field,
      index,
      parentSchemaPath,
      parentIndexPath,
    })
    if (field.type === 'group' && 'name' in field && field.name === 'theme')
      return { field, schemaPath: paths.schemaPath, parentSchemaPath }
    if (field.type === 'tabs') {
      for (const [tabIndex, tab] of field.tabs.entries()) {
        const tabPaths = getFieldPaths({
          field: tab,
          index: tabIndex,
          parentSchemaPath: paths.schemaPath,
          parentIndexPath: paths.indexPath,
        })
        const found = findTheme(
          tab.fields,
          tabPaths.schemaPath,
          tabPaths.indexPath,
        )
        if (found) return found
      }
    } else if ('fields' in field) {
      const found = findTheme(field.fields, paths.schemaPath, paths.indexPath)
      if (found) return found
    }
  }
}

/** Keep every field index so native custom components resolve their original schema paths. */
export function themeSectionFields(
  fields: ClientField[],
  section: Section,
): ClientField[] {
  return fields.map((field) => {
    const label = 'label' in field ? field.label : undefined
    const area =
      field.type === 'collapsible' && label === 'Typography'
        ? 'Typography'
        : field.type === 'collapsible' && label === 'Palettes'
          ? 'Colors'
          : 'Design'
    if (area !== section)
      return {
        ...field,
        admin: { ...field.admin, hidden: true },
      } as ClientField
    if (field.type === 'collapsible') {
      // An unnamed group has the same path/index as the original unnamed panel.
      return {
        type: 'group',
        label: false,
        fields: field.fields.map((child) =>
          child.type === 'group'
            ? { ...child, admin: { ...child.admin, hideGutter: true } }
            : child,
        ),
        admin: { hideGutter: true },
      } as ClientField
    }
    return field
  })
}

/** Present existing theme fields in main-row tabs using Payload's native renderer. */
export function ThemeSection({
  section,
  readOnly,
}: UIFieldClientProps & { section: Section }) {
  const { docConfig, docPermissions, documentIsLocked } = useDocumentInfo()
  const operation = useOperation()
  const theme = docConfig && findTheme(docConfig.fields, docConfig.slug)
  if (!theme || !operation) return null
  const access = getFieldPermissions({
    field: theme.field,
    operation,
    permissions: docPermissions?.fields ?? {},
    parentName: '',
    collectionPermissions: docPermissions,
  })
  if (!access.read) return null
  return (
    <GroupField
      field={{
        ...theme.field,
        label: '',
        admin: { ...theme.field.admin, hidden: false, hideGutter: true },
        fields: themeSectionFields(theme.field.fields, section),
      }}
      path="theme"
      schemaPath={theme.schemaPath}
      parentPath=""
      parentSchemaPath={theme.parentSchemaPath}
      permissions={access.permissions as SanitizedFieldPermissions}
      readOnly={Boolean(
        readOnly ||
        documentIsLocked ||
        theme.field.admin?.readOnly ||
        !access.operation,
      )}
    />
  )
}
