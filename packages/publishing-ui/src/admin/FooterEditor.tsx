'use client'

import { useId, useState, type ReactNode } from 'react'
import {
  useDroppable,
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RenderFields, useForm, useFormFields, useField } from '@payloadcms/ui'
import type {
  ArrayFieldClient,
  BlocksFieldClient,
  ClientBlock,
  ClientField,
  SanitizedFieldPermissions,
  SanitizedFieldsPermissions,
} from 'payload'
import type {
  FooterContentArea,
  FooterContentBlock,
} from '@danielmarkland/publishing-contracts'
import { moveFooterBlock } from '@danielmarkland/publishing-core/footerLayout'
import './FooterEditor.css'

type Selection = { kind: 'area' | 'column' | 'block'; id: string }
const uid = () => crypto.randomUUID()
function label(block: ClientBlock | undefined, fallback: string): string {
  const name = block?.labels?.singular
  return typeof name === 'string' ? name : fallback
}
function ColumnDrop({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${id}`,
    data: { columnId: id },
  })
  return (
    <div
      ref={setNodeRef}
      data-footer-column={id}
      className={`footer-editor__drop${isOver ? ' footer-editor__drop--over' : ''}`}
    >
      {children}
    </div>
  )
}
function BlockCard({
  block,
  columnId,
  name,
  selected,
  disabled,
  onSelect,
}: {
  block: FooterContentBlock
  columnId: string
  name: string
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id!,
    disabled,
    data: { columnId, blockId: block.id },
  })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`footer-editor__block${selected ? ' footer-editor__block--selected' : ''}`}
    >
      <button
        type="button"
        aria-label={`Drag ${name}`}
        {...attributes}
        {...listeners}
        disabled={disabled}
        className="footer-editor__handle"
      >
        ⠿
      </button>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className="footer-editor__block-content"
      >
        <strong>{name}</strong>
        {block.heading ? <span>{block.heading}</span> : null}
      </button>
    </div>
  )
}

export function FooterEditor({
  field,
  path,
  schemaPath,
  readOnly = false,
  permissions,
}: {
  field: ArrayFieldClient
  path: string
  schemaPath: string
  readOnly?: boolean
  permissions?: SanitizedFieldPermissions
}) {
  const form = useForm()
  const dragContextId = useId()
  useFormFields(([fields]) => fields)
  const { disabled: fieldDisabled } = useField({ path, hasRows: true })
  const areas = form.getDataByPath<FooterContentArea[]>(path) ?? []
  const [selection, setSelection] = useState<Selection | null>(null)
  const [mobile, setMobile] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const disabled = readOnly || fieldDisabled || busy
  const columnsField = field.fields.find(
    (f) => 'name' in f && f.name === 'columns',
  ) as ArrayFieldClient
  const blocksField = columnsField.fields.find(
    (f) => 'name' in f && f.name === 'blocks',
  ) as BlocksFieldClient
  const blocks = blocksField.blocks.filter(
    (b): b is ClientBlock => typeof b !== 'string',
  )
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  async function update(next: FooterContentArea[]) {
    if (disabled) return
    setBusy(true)
    setError('')
    try {
      await form.reset({ ...form.getData(), [path]: next })
      form.setModified(true)
    } catch {
      setError(
        'The layout could not be updated. Your existing content is still available; try again.',
      )
    } finally {
      setBusy(false)
    }
  }
  function change(fn: (next: FooterContentArea[]) => void) {
    const next = structuredClone(areas)
    fn(next)
    void update(next)
  }
  function reorder<T>(items: T[], index: number, offset: number) {
    const target = index + offset
    if (target < 0 || target >= items.length) return
    const [item] = items.splice(index, 1)
    if (item !== undefined) items.splice(target, 0, item)
  }
  function dragEnd(event: DragEndEvent) {
    const blockId = event.active.data.current?.blockId as string | undefined
    const columnId = event.over?.data.current?.columnId as string | undefined
    if (blockId && columnId) {
      const column = areas
        .flatMap((area) => area.columns)
        .find((item) => item.id === columnId)
      const sourceIndex =
        column?.blocks?.findIndex((block) => block.id === blockId) ?? -1
      const targetIndex =
        column?.blocks?.findIndex(
          (block) => block.id === event.over?.data.current?.blockId,
        ) ?? -1
      const beforeId =
        sourceIndex >= 0 && targetIndex > sourceIndex
          ? column?.blocks?.[targetIndex + 1]?.id
          : event.over?.data.current?.blockId
      void update(
        moveFooterBlock(
          areas,
          blockId,
          columnId,
          beforeId as string | undefined,
        ),
      )
    }
  }
  const childFields = (
    value?: true | { fields?: SanitizedFieldsPermissions },
  ) => (value === true ? true : value?.fields)
  const childPermission = (
    fields: SanitizedFieldsPermissions | undefined,
    name: string,
  ) => (fields === true ? true : fields?.[name])
  const areaPermissions = childFields(permissions)
  const columnPermissions = childFields(
    childPermission(areaPermissions, 'columns'),
  )
  const blocksPermissions = childPermission(columnPermissions, 'blocks')
  let panel: {
    fields: ClientField[]
    path: string
    schema: string
    title: string
    permissions?: SanitizedFieldsPermissions
  } | null = null
  for (const [ai, area] of areas.entries()) {
    if (selection?.kind === 'area' && selection.id === area.id)
      panel = {
        fields: field.fields.filter(
          (f) => !('name' in f) || f.name !== 'columns',
        ),
        path: `${path}.${ai}`,
        schema: schemaPath,
        title: 'Content area settings',
        permissions: areaPermissions,
      }
    for (const [ci, column] of area.columns.entries()) {
      if (selection?.kind === 'column' && selection.id === column.id)
        panel = {
          fields: columnsField.fields.filter(
            (f) => !('name' in f) || f.name !== 'blocks',
          ),
          path: `${path}.${ai}.columns.${ci}`,
          schema: `${schemaPath}.columns`,
          title: 'Column settings',
          permissions: columnPermissions,
        }
      for (const [bi, block] of (column.blocks ?? []).entries())
        if (selection?.kind === 'block' && selection.id === block.id) {
          const config = blocks.find((b) => b.slug === block.blockType)
          if (config)
            panel = {
              fields: config.fields,
              path: `${path}.${ai}.columns.${ci}.blocks.${bi}`,
              schema: `${schemaPath}.columns.blocks.${block.blockType}`,
              title: `${label(config, block.blockType)} settings`,
              permissions:
                blocksPermissions === true
                  ? true
                  : childFields(
                      blocksPermissions?.blocks === true
                        ? true
                        : blocksPermissions?.blocks?.[block.blockType],
                    ),
            }
        }
    }
  }
  const allColumns = areas.flatMap((area, ai) =>
    area.columns.map((column, ci) => ({
      column,
      label: `${area.title || `Area ${ai + 1}`} / Column ${ci + 1}`,
    })),
  )
  return (
    <section
      className="footer-editor"
      aria-label="Footer layout editor"
      aria-busy={busy}
    >
      <div className="footer-editor__toolbar">
        <h3>Footer content areas</h3>
        <button
          type="button"
          aria-pressed={mobile}
          onClick={() => setMobile(!mobile)}
        >
          {mobile ? 'Desktop layout' : 'Mobile layout'}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const id = uid()
            void update([
              ...areas,
              {
                id,
                title: `Area ${areas.length + 1}`,
                appearance: { paddingTop: 'md', paddingBottom: 'md' },
                columns: [{ id: uid(), alignment: 'start', blocks: [] }],
              },
            ])
            setSelection({ kind: 'area', id })
          }}
        >
          Add content area
        </button>
      </div>
      <p>
        Add areas and columns, then drag blocks into position. Select a block to
        edit its settings. Save the document to publish your changes.
      </p>
      {error ? <p role="alert">{error}</p> : null}
      <div className="footer-editor__workspace">
        <DndContext
          id={dragContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={dragEnd}
        >
          <div
            className={`footer-editor__board${mobile ? ' footer-editor__board--mobile' : ''}`}
          >
            {areas.length === 0 ? (
              <p>No footer content areas. Add one to begin.</p>
            ) : null}
            {areas.map((area, ai) => (
              <section
                className="footer-editor__area"
                key={area.id}
                aria-label={area.title || `Area ${ai + 1}`}
              >
                <div className="footer-editor__area-toolbar">
                  <button
                    type="button"
                    onClick={() => setSelection({ kind: 'area', id: area.id! })}
                  >
                    {area.title || `Area ${ai + 1}`}
                  </button>
                  <button
                    type="button"
                    aria-label={`Move area ${ai + 1} up`}
                    disabled={disabled || ai === 0}
                    onClick={() => change((next) => reorder(next, ai, -1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move area ${ai + 1} down`}
                    disabled={disabled || ai === areas.length - 1}
                    onClick={() => change((next) => reorder(next, ai, 1))}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={disabled || area.columns.length === 4}
                    onClick={() =>
                      change((next) =>
                        next[ai]!.columns.push({
                          id: uid(),
                          blocks: [],
                          alignment: 'start',
                        }),
                      )
                    }
                  >
                    Add column
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (
                        !area.columns.some((c) => c.blocks?.length) ||
                        window.confirm(
                          'Remove this content area and all of its blocks?',
                        )
                      )
                        change((next) => {
                          next.splice(ai, 1)
                        })
                      if (selection?.id === area.id) setSelection(null)
                    }}
                  >
                    Remove area
                  </button>
                </div>
                <div
                  className="footer-editor__columns"
                  style={{
                    gridTemplateColumns: mobile
                      ? 'minmax(0, 1fr)'
                      : `repeat(${area.columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {area.columns.map((column, ci) => (
                    <div className="footer-editor__column" key={column.id}>
                      <div className="footer-editor__column-toolbar">
                        <button
                          type="button"
                          onClick={() =>
                            setSelection({ kind: 'column', id: column.id! })
                          }
                        >
                          Column {ci + 1}
                        </button>
                        <button
                          type="button"
                          aria-label={`Move column ${ci + 1} left in area ${ai + 1}`}
                          disabled={disabled || ci === 0}
                          onClick={() =>
                            change((next) => reorder(next[ai]!.columns, ci, -1))
                          }
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          aria-label={`Move column ${ci + 1} right in area ${ai + 1}`}
                          disabled={disabled || ci === area.columns.length - 1}
                          onClick={() =>
                            change((next) => reorder(next[ai]!.columns, ci, 1))
                          }
                        >
                          →
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove column ${ci + 1} in area ${ai + 1}`}
                          disabled={disabled || area.columns.length === 1}
                          onClick={() => {
                            if (
                              !column.blocks?.length ||
                              window.confirm(
                                'Remove this column and all of its blocks?',
                              )
                            )
                              change((next) => {
                                next[ai]!.columns.splice(ci, 1)
                              })
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <ColumnDrop id={column.id!}>
                        <SortableContext
                          items={(column.blocks ?? []).map((b) => b.id!)}
                          strategy={verticalListSortingStrategy}
                        >
                          {(column.blocks ?? []).map((block) => (
                            <BlockCard
                              key={block.id}
                              block={block}
                              columnId={column.id!}
                              name={label(
                                blocks.find((b) => b.slug === block.blockType),
                                block.blockType,
                              )}
                              selected={selection?.id === block.id}
                              disabled={disabled}
                              onSelect={() =>
                                setSelection({ kind: 'block', id: block.id! })
                              }
                            />
                          ))}
                        </SortableContext>
                        {!column.blocks?.length ? (
                          <p className="footer-editor__empty">
                            Drop blocks here
                          </p>
                        ) : null}
                      </ColumnDrop>
                      <label className="footer-editor__add">
                        Add block
                        <select
                          aria-label={`Add block to area ${ai + 1} column ${ci + 1}`}
                          value=""
                          disabled={disabled}
                          onChange={(event) => {
                            const type = event.target.value
                            if (!type) return
                            const id = uid()
                            change((next) => {
                              next[ai]!.columns[ci]!.blocks ??= []
                              next[ai]!.columns[ci]!.blocks!.push({
                                id,
                                blockType: type,
                              } as FooterContentBlock)
                            })
                            setSelection({ kind: 'block', id })
                          }}
                        >
                          <option value="">Choose a component…</option>
                          {blocks.map((block) => (
                            <option key={block.slug} value={block.slug}>
                              {label(block, block.slug)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </DndContext>
        <aside
          className="footer-editor__settings"
          aria-label="Footer component settings"
        >
          {panel ? (
            <>
              <h3>{panel.title}</h3>
              {selection?.kind === 'block' ? (
                <div className="footer-editor__block-tools">
                  <label>
                    Move to column
                    <select
                      aria-label="Move selected block to column"
                      disabled={disabled}
                      value={
                        allColumns.find(({ column }) =>
                          column.blocks?.some((b) => b.id === selection.id),
                        )?.column.id || ''
                      }
                      onChange={(event) =>
                        void update(
                          moveFooterBlock(
                            areas,
                            selection.id,
                            event.target.value,
                          ),
                        )
                      }
                    >
                      {allColumns.map(({ column, label: columnLabel }) => (
                        <option key={column.id} value={column.id!}>
                          {columnLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      change((next) => {
                        for (const area of next)
                          for (const column of area.columns) {
                            const index =
                              column.blocks?.findIndex(
                                (b) => b.id === selection.id,
                              ) ?? -1
                            if (index >= 0) reorder(column.blocks!, index, -1)
                          }
                      })
                    }
                  >
                    Move block up
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      change((next) => {
                        for (const area of next)
                          for (const column of area.columns) {
                            const index =
                              column.blocks?.findIndex(
                                (b) => b.id === selection.id,
                              ) ?? -1
                            if (index >= 0) reorder(column.blocks!, index, 1)
                          }
                      })
                    }
                  >
                    Move block down
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (window.confirm('Remove this block?')) {
                        change((next) => {
                          for (const area of next)
                            for (const column of area.columns)
                              column.blocks = column.blocks?.filter(
                                (b) => b.id !== selection.id,
                              )
                        })
                        setSelection(null)
                      }
                    }}
                  >
                    Remove block
                  </button>
                </div>
              ) : null}
              <fieldset disabled={disabled}>
                <RenderFields
                  key={panel.path}
                  fields={panel.fields}
                  parentPath={panel.path}
                  parentSchemaPath={panel.schema}
                  parentIndexPath=""
                  permissions={panel.permissions ?? {}}
                  readOnly={disabled}
                />
              </fieldset>
            </>
          ) : (
            <p>Select an area, column, or block to edit its settings.</p>
          )}
        </aside>
      </div>
    </section>
  )
}
