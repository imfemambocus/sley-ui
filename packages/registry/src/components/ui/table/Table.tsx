import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Checkbox, type CheckedState } from '@/components/ui/checkbox/Checkbox'
import { EmptyState } from '@/components/ui/empty-state/EmptyState'
import { Tooltip } from '@/components/ui/tooltip/Tooltip'
import { cx } from '@/lib/cx'

export interface Column<T> {
  readonly key: string
  readonly label: string
  readonly unit?: string
  readonly hint?: string
  /* the widest plausible value, in characters. the density turns it into a width. */
  readonly chars: number
  readonly numeric?: boolean
  readonly sortValue?: (row: T) => string | number
  readonly render: (row: T) => ReactNode
}

type Direction = 'asc' | 'desc'

interface Sort {
  readonly key: string
  readonly direction: Direction
}

const MIN_WIDTH = 56
const MAX_WIDTH = 420
const KEY_STEP = 8

/* the 7px mark and its 6px gap: two characters cover both in every density */
const SORT_CHARS = 2

/* doubles as the left offset of the pinned column beside it */
const GUTTER = 'calc(var(--cell-x) * 2 + var(--ctl-box))'

/*
 * a pinned cell hides what travels under it, so it needs an opaque background and a
 * transition of its own. a parent transition does not animate an inherited value.
 */
const PINNED = 'warp-line-end bg-inherit px-(--cell-x) transition-colors duration-(--dur-instant) ease-(--ease-beat)'

function compare(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function ariaSort<T>(sort: Sort | null, column: Column<T>) {
  if (column.sortValue === undefined) return undefined
  if (sort?.key !== column.key) return 'none'
  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
}

/*
 * the head counts too, because a label and its unit can run longer than the value
 * under it. the half character covers the rounding a table layout applies.
 */
function intrinsicWidth<T>(column: Column<T>, sorted: boolean) {
  const unit = column.unit ? column.unit.length + 1 : 0
  const head = column.label.length + unit + (sorted ? SORT_CHARS : 0)
  return `calc(${Math.max(column.chars, head) + 0.5} * var(--data-adv) + var(--cell-x) * 2)`
}

interface ColumnGripProps {
  readonly label: string
  readonly onResize: (next: number) => void
}

/* the width on screen. a column that never moved holds no px of its own. */
const cellWidth = (grip: HTMLButtonElement) => grip.parentElement?.offsetWidth ?? 0

const ColumnGrip = ({ label, onResize }: ColumnGripProps) => {
  const originX = useRef(0)
  const originWidth = useRef(0)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    originX.current = event.clientX
    originWidth.current = cellWidth(event.currentTarget)
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    onResize(originWidth.current + event.clientX - originX.current)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const from = cellWidth(event.currentTarget)
    onResize(event.key === 'ArrowLeft' ? from - KEY_STEP : from + KEY_STEP)
  }

  return (
    <button
      type="button"
      aria-label={`Resize the ${label} column`}
      className="reed-grip"
      data-dragging={dragging ? '' : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onLostPointerCapture={() => setDragging(false)}
      onKeyDown={onKeyDown}
    />
  )
}

const SortMark = ({ direction }: { readonly direction: Direction }) => (
  <span className={cx('reed-sort text-indigo', direction === 'desc' && 'reed-sort-down')} aria-hidden="true" />
)

interface ColumnHeadProps<T> {
  readonly column: Column<T>
  readonly sort: Sort | null
  readonly onSort: () => void
}

const ColumnHead = <T,>({ column, sort, onSort }: ColumnHeadProps<T>) => {
  const shell = cx('flex h-full w-full items-center gap-1.5 text-weft-dim', column.numeric && 'justify-end')
  /* the mark sits inside the baseline group, standing on the baseline of the label */
  const label = (
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      <span className="truncate">{column.label}</span>
      {column.unit && <span className="font-data text-weft-faint">{column.unit}</span>}
      {sort?.key === column.key && <SortMark direction={sort.direction} />}
    </span>
  )

  const head = column.sortValue ? (
    <button
      type="button"
      onClick={onSort}
      className={cx(shell, 'cursor-pointer transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft')}
    >
      {label}
    </button>
  ) : (
    <div className={shell}>{label}</div>
  )

  if (column.hint === undefined) return head
  return <Tooltip content={column.hint}>{head}</Tooltip>
}

const SKELETON_IDS: readonly string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => `warp-${id}`)

const WarpRows = ({ span }: { readonly span: number }) => (
  <>
    {SKELETON_IDS.map((id, index) => (
      <tr key={id}>
        <td
          colSpan={span}
          className="reed-warp reed-warp-beat"
          style={{ height: 'var(--row-h)', animationDelay: `calc(var(--dur-instant) * ${index})` }}
        />
      </tr>
    ))}
  </>
)

interface EmptyRowProps {
  readonly span: number
  readonly message: string
}

const EmptyRow = ({ span, message }: EmptyRowProps) => (
  <tr>
    <td colSpan={span} className="border-t border-reed/60 p-0">
      <EmptyState title={message} />
    </td>
  </tr>
)

interface RowProps<T> {
  readonly row: T
  readonly id: string
  readonly columns: readonly Column<T>[]
  readonly selected: boolean
  readonly onToggle: (id: string) => void
}

const Row =<T,>({ row, id, columns, selected, onToggle }: RowProps<T>) => (
  <tr
    className="bg-raised transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed data-selected:bg-indigo-wash data-selected:hover:bg-indigo-wash"
    data-selected={selected ? '' : undefined}
  >
    <td
      className={cx('selvedge sticky left-0 z-(--z-pinned) border-t border-reed/60', PINNED, selected && 'selvedge-on')}
      style={{ height: 'var(--row-h)' }}
    >
      <Checkbox checked={selected} onCheckedChange={() => onToggle(id)} label={`Select row ${id}`} />
    </td>
    {columns.map((column, index) => (
      <td
        key={column.key}
        className={cx(
          'truncate border-t border-reed/60 px-(--cell-x) text-weft-dim',
          index === 0 && `sticky z-(--z-pinned) ${PINNED}`,
          index > 1 && 'warp-line',
          column.numeric && 'tnum text-right font-data text-weft',
        )}
        style={{ height: 'var(--row-h)', left: index === 0 ? GUTTER : undefined }}
      >
        {column.render(row)}
      </td>
    ))}
    <td className="warp-line border-t border-reed/60" />
  </tr>
)

interface TableProps<T> {
  readonly rows: readonly T[]
  readonly columns: readonly Column<T>[]
  readonly rowId: (row: T) => string
  readonly title: string
  readonly noun?: string
  readonly emptyMessage?: string
  readonly loading?: boolean
  readonly actions?: ReactNode
  readonly onSelectionChange?: (selected: ReadonlySet<string>) => void
  readonly className?: string
}

export const Table = <T,>({
  rows,
  columns,
  rowId,
  title,
  noun = 'rows',
  emptyMessage = 'No row matches the filters.',
  loading = false,
  actions,
  onSelectionChange,
  className,
}: TableProps<T>) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  /* only a dragged column holds a px width; the rest follow the density */
  const [widths, setWidths] = useState<Record<string, number | undefined>>({})
  const [sort, setSort] = useState<Sort | null>(null)

  const span = columns.length + 2

  const resizeColumn = (key: string, next: number) => {
    setWidths((current) => ({ ...current, [key]: clampWidth(next) }))
  }

  /* third click restores the order the rows arrived in */
  const toggleSort = (key: string) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' }
      if (current.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
  }

  const ordered = useMemo(() => {
    const column = columns.find((entry) => entry.key === sort?.key)
    const value = column?.sortValue
    if (sort === null || value === undefined) return rows
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compare(value(a), value(b)))
  }, [rows, columns, sort])

  /*
   * a filter can take a selected row off the screen. the count and the head control
   * read only what is on screen, and the set keeps the rest for when it comes back.
   */
  const onScreen = useMemo(() => new Set(rows.map(rowId)), [rows, rowId])
  const active = useMemo(() => new Set([...selected].filter((id) => onScreen.has(id))), [selected, onScreen])

  const headerState = useMemo<CheckedState>(() => {
    if (active.size === 0) return false
    if (active.size === rows.length) return true
    return 'indeterminate'
  }, [active, rows.length])

  const applySelection = (next: ReadonlySet<string>) => {
    setSelected(next)
    onSelectionChange?.(new Set([...next].filter((id) => onScreen.has(id))))
  }

  const toggleRow = (id: string) => {
    const next = new Set(selected)
    if (!next.delete(id)) next.add(id)
    applySelection(next)
  }

  const toggleAll = () => {
    const next = new Set(selected)
    if (active.size === rows.length) {
      onScreen.forEach((id) => next.delete(id))
    } else {
      onScreen.forEach((id) => next.add(id))
    }
    applySelection(next)
  }

  const renderBody = () => {
    if (loading) return <WarpRows span={span} />
    if (ordered.length === 0) return <EmptyRow span={span} message={emptyMessage} />
    return ordered.map((row) => {
      const id = rowId(row)
      return <Row key={id} row={row} id={id} columns={columns} selected={selected.has(id)} onToggle={toggleRow} />
    })
  }

  return (
    <section className={cx('@container border border-reed bg-raised', className)}>
      <header className="flex items-center justify-between gap-(--stack) border-b border-reed px-(--cell-x) py-(--stack)">
        <h2 className="font-medium">{title}</h2>
        <div className="flex items-center gap-(--stack)">
          {!loading && (
            <p className="text-weft-dim tnum">
              {active.size > 0 ? `${active.size} of ${rows.length} selected` : `${rows.length} ${noun}`}
            </p>
          )}
          {actions}
        </div>
      </header>

      <div className="reed-scroll max-h-130 overflow-auto">
        {/* separate borders: a pinned cell paints its background over a collapsed one */}
        <table aria-busy={loading} className="w-full table-fixed border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-(--z-sticky)">
            <tr className="bg-raised select-none">
              <th
                scope="col"
                className="reed-edge warp-line-end sticky left-0 z-(--z-pinned) bg-raised px-(--cell-x)"
                style={{ height: 'var(--row-h)', width: GUTTER }}
              >
                <Checkbox checked={headerState} onCheckedChange={toggleAll} label={`Select all ${noun}`} />
              </th>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort(sort, column)}
                  className={cx(
                    'reed-edge px-(--cell-x) font-medium',
                    index === 0 && 'warp-line-end sticky z-(--z-pinned) bg-raised',
                  )}
                  style={{
                    height: 'var(--row-h)',
                    left: index === 0 ? GUTTER : undefined,
                    width: widths[column.key] ?? intrinsicWidth(column, sort?.key === column.key),
                  }}
                >
                  <ColumnHead column={column} sort={sort} onSort={() => toggleSort(column.key)} />
                  <ColumnGrip label={column.label} onResize={(next) => resizeColumn(column.key, next)} />
                </th>
              ))}
              <th scope="col" className="reed-edge">
                <span className="sr-only">Spare width</span>
              </th>
            </tr>
          </thead>

          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    </section>
  )
}
