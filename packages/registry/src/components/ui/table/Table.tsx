import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Checkbox, type CheckedState } from '@/components/ui/checkbox/Checkbox'
import { cx } from '@/lib/cx'

export interface Column<T> {
  readonly key: string
  readonly label: string
  readonly unit?: string
  /* the characters the widest plausible value holds, which the density turns into a width */
  readonly chars: number
  readonly numeric?: boolean
  /* the class literal that hides the column, so the tailwind scanner can read it in the caller */
  readonly drop?: string
  readonly sortValue: (row: T) => string | number
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

/* the sort mark is 7px and its gap is 6px, which two characters cover in every density */
const SORT_CHARS = 2

function compare(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function ariaSort(sort: Sort | null, key: string) {
  if (sort?.key !== key) return 'none'
  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
}

/*
 * a column declares the characters it holds, and the density supplies the rest. the
 * head counts too, because a label and its unit can be longer than the value under
 * it. the count is in the advance of the data face, and the half character covers
 * the rounding that a table layout applies to a column.
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

/* the drag starts from the width on screen, so a column that never moved needs no px of its own */
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

/* three ticks of the reed, short to tall, which reads as a direction without a glyph */
const SortMark = ({ direction }: { readonly direction: Direction }) => (
  <span className={cx('reed-sort text-indigo', direction === 'desc' && 'reed-sort-down')} aria-hidden="true" />
)

interface ColumnHeadProps<T> {
  readonly column: Column<T>
  readonly sort: Sort | null
  readonly onSort: () => void
}

const ColumnHead = <T,>({ column, sort, onSort }: ColumnHeadProps<T>) => (
  <button
    type="button"
    onClick={onSort}
    className={cx(
      'flex h-full w-full cursor-pointer items-center gap-1.5 text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft',
      column.numeric && 'justify-end',
    )}
  >
    {/* the mark joins the baseline group, so its ticks stand on the baseline of the label */}
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      <span className="truncate">{column.label}</span>
      {column.unit && <span className="font-data text-weft-faint">{column.unit}</span>}
      {sort?.key === column.key && <SortMark direction={sort.direction} />}
    </span>
  </button>
)

const SKELETON_IDS: readonly string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => `warp-${id}`)

/* the weft arrives one row after another, so each row waits one instant longer than the row above it */
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

/* an empty result is the loom threaded and standing still, so the warp holds and the weft does not come */
const EmptyRow = ({ span, message }: EmptyRowProps) => (
  <tr>
    <td
      colSpan={span}
      className="reed-warp border-t border-reed/60 text-center align-middle text-weft-dim"
      style={{ height: 'calc(var(--row-h) * 4)' }}
    >
      {message}
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

/*
 * the row declares every state, and the pinned cell inherits the colour. an opaque
 * hover colour is what allows that, because the pinned cell has to hide the cells
 * that travel under it.
 */
const Row = <T,>({ row, id, columns, selected, onToggle }: RowProps<T>) => (
  <tr
    className="bg-raised transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed data-selected:bg-indigo-wash data-selected:hover:bg-indigo-wash"
    data-selected={selected ? '' : undefined}
  >
    <td
      className="warp-line-end sticky left-0 z-(--z-pinned) border-t border-reed/60 bg-inherit px-(--cell-x) transition-colors duration-(--dur-instant) ease-(--ease-beat)"
      style={{ height: 'var(--row-h)' }}
    >
      <Checkbox checked={selected} onCheckedChange={() => onToggle(id)} label={`Select row ${id}`} />
    </td>
    {columns.map((column, index) => (
      <td
        key={column.key}
        className={cx(
          'truncate border-t border-reed/60 px-(--cell-x) text-weft-dim',
          index > 0 && 'warp-line',
          column.drop,
          column.numeric && 'tnum text-right font-data text-weft',
        )}
        style={{ height: 'var(--row-h)' }}
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
  /* the word the count reads with, and the word the select all control announces */
  readonly noun?: string
  readonly emptyMessage?: string
  readonly loading?: boolean
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
  onSelectionChange,
  className,
}: TableProps<T>) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  /* only a column the user dragged holds a px width. the rest follow the density. */
  const [widths, setWidths] = useState<Record<string, number | undefined>>({})
  const [sort, setSort] = useState<Sort | null>(null)

  const span = columns.length + 2

  const resizeColumn = (key: string, next: number) => {
    setWidths((current) => ({ ...current, [key]: clampWidth(next) }))
  }

  /* the third click restores the order the rows arrived in, which is a state of its own */
  const toggleSort = (key: string) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' }
      if (current.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
  }

  const ordered = useMemo(() => {
    const column = columns.find((entry) => entry.key === sort?.key)
    if (sort === null || column === undefined) return rows
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compare(column.sortValue(a), column.sortValue(b)))
  }, [rows, columns, sort])

  const headerState = useMemo<CheckedState>(() => {
    if (selected.size === 0) return false
    if (selected.size === rows.length) return true
    return 'indeterminate'
  }, [selected, rows.length])

  const applySelection = (next: ReadonlySet<string>) => {
    setSelected(next)
    onSelectionChange?.(next)
  }

  const toggleRow = (id: string) => {
    const next = new Set(selected)
    if (!next.delete(id)) next.add(id)
    applySelection(next)
  }

  const toggleAll = () => {
    applySelection(selected.size === rows.length ? new Set() : new Set(rows.map(rowId)))
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
      <header className="flex items-center justify-between border-b border-reed px-(--cell-x) py-(--stack)">
        <h2 className="font-medium">{title}</h2>
        {!loading && (
          <p className="text-weft-dim tnum">
            {selected.size > 0 ? `${selected.size} of ${rows.length} selected` : `${rows.length} ${noun}`}
          </p>
        )}
      </header>

      <div className="reed-scroll max-h-130 overflow-auto">
        {/* separate borders, because a pinned cell paints its background over a collapsed one */}
        <table aria-busy={loading} className="w-full table-fixed border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-(--z-sticky)">
            <tr className="bg-raised select-none">
              {/* the gutter is its padding plus its control, so the box never flexes down */}
              <th
                scope="col"
                className="reed-edge warp-line-end sticky left-0 z-(--z-pinned) bg-raised px-(--cell-x)"
                style={{ height: 'var(--row-h)', width: 'calc(var(--cell-x) * 2 + var(--ctl-box))' }}
              >
                <Checkbox checked={headerState} onCheckedChange={toggleAll} label={`Select all ${noun}`} />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort(sort, column.key)}
                  className={cx('reed-edge px-(--cell-x) font-medium', column.drop)}
                  style={{
                    height: 'var(--row-h)',
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
