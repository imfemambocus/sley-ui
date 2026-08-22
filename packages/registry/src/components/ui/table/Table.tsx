import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type UIEvent,
} from 'react'
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

/*
 * below this many rows the whole body is rendered. the widest viewport shows about 20
 * rows at the dense height, so this leaves several screens before a window is worth it.
 */
const WINDOW_MIN = 100
const OVERSCAN = 6

/*
 * an effect supplies the row height, which leaves the first commit of a long batch without
 * one. 40 rows covers the 520px body cap at the dense height with the overscan on top.
 */
const FIRST_ROWS = 40

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

/* a plural noun alone reads "1 rows" at a count of one, so a caller can give both forms */
function countNoun(noun: string | readonly [one: string, many: string], count: number) {
  if (typeof noun === 'string') return noun
  return count === 1 ? noun[0] : noun[1]
}

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
}

/*
 * the head counts too, because a label and its unit can run longer than the value
 * under it. the half character covers the rounding a table layout applies.
 *
 * the head is drawn in the interface face and the value under it in the data face,
 * so the head takes whichever of the two advances is wider. `1ch` is the interface
 * face's own digit advance, read off this cell. where the data face is the wider of
 * the pair the expression collapses to what it always was.
 */
function intrinsicWidth<T>(column: Column<T>, sorted: boolean) {
  const unit = column.unit ? column.unit.length + 1 : 0
  const head = column.label.length + unit + (sorted ? SORT_CHARS : 0)
  const value = `${column.chars + 0.5} * var(--data-adv)`
  const label = `${head + 0.5} * max(var(--data-adv), 1ch)`
  return `calc(max(${value}, ${label}) + var(--cell-x) * 2)`
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

/* the rows outside the window still take their height, so the scrollbar tells the truth */
const Spacer = ({ span, height }: { readonly span: number; readonly height: number }) => (
  <tr aria-hidden="true">
    <td colSpan={span} style={{ height, padding: 0, border: 0 }} />
  </tr>
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

const NAV_KEYS: ReadonlySet<string> = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

/* a control in a cell owns its own click, and the checkbox sits inside a label */
const INTERACTIVE = 'a, button, input, select, textarea, label'

interface RowProps<T> {
  readonly row: T
  readonly id: string
  readonly columns: readonly Column<T>[]
  readonly selected: boolean
  readonly onToggle: (id: string) => void
  readonly rowIndex: number
  readonly position: number
  readonly cursor: boolean
  readonly onNavigate: (from: number, key: string) => void
  readonly onActivate?: (row: T) => void
}

const Row = <T,>({
  row,
  id,
  columns,
  selected,
  onToggle,
  rowIndex,
  position,
  cursor,
  onNavigate,
  onActivate,
}: RowProps<T>) => {
  const onClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (onActivate === undefined) return
    if (event.target instanceof Element && event.target.closest(INTERACTIVE) !== null) return
    onActivate(row)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    /* a key pressed on the checkbox inside the row belongs to the checkbox */
    if (event.target !== event.currentTarget) return

    if (event.key === ' ') {
      event.preventDefault()
      onToggle(id)
      return
    }

    if (event.key === 'Enter' && onActivate !== undefined) {
      event.preventDefault()
      onActivate(row)
      return
    }

    if (!NAV_KEYS.has(event.key)) return
    event.preventDefault()
    onNavigate(position, event.key)
  }

  return (
    <tr
      aria-rowindex={rowIndex}
      tabIndex={cursor ? 0 : -1}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={cx(
        'focus-row bg-raised transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed data-selected:bg-indigo-wash data-selected:hover:bg-indigo-wash',
        onActivate !== undefined && 'cursor-pointer',
      )}
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
}

interface TableProps<T> {
  readonly rows: readonly T[]
  readonly columns: readonly Column<T>[]
  readonly rowId: (row: T) => string
  readonly title: string
  readonly noun?: string | readonly [one: string, many: string]
  readonly emptyMessage?: string
  readonly loading?: boolean
  readonly actions?: ReactNode
  readonly onSelectionChange?: (selected: ReadonlySet<string>) => void
  /* the row draws a pointer and answers Enter once this is given */
  readonly onRowActivate?: (row: T) => void
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
  onRowActivate,
  className,
}: TableProps<T>) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  /* only a dragged column holds a px width; the rest follow the density */
  const [widths, setWidths] = useState<Record<string, number | undefined>>({})
  const [sort, setSort] = useState<Sort | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)

  /* raised by a key press, so the focus chase below ignores a scroll the pointer made */
  const chasing = useRef(false)

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

  /*
   * every row is exactly --row-h, so the window is arithmetic and needs no per row
   * measurement. the height is read off a real row rather than the token, which keeps
   * it right when the density changes under the component.
   */
  const scroller = useRef<HTMLDivElement>(null)
  const headRow = useRef<HTMLTableRowElement>(null)
  const [metrics, setMetrics] = useState({ rowHeight: 0, viewport: 0 })
  const [scrollTop, setScrollTop] = useState(0)

  const long = ordered.length > WINDOW_MIN

  /*
   * the head row carries the same --row-h and keeps its identity for the life of the
   * table, so it is the one element that can be observed. a body row is re-keyed on
   * every scroll, which leaves the observer watching a detached node.
   */
  useEffect(() => {
    const box = scroller.current
    const head = headRow.current
    if (!box || !head || !long) return undefined

    const read = () => setMetrics({ rowHeight: head.getBoundingClientRect().height, viewport: box.clientHeight })
    read()

    const observer = new ResizeObserver(read)
    observer.observe(box)
    observer.observe(head)
    return () => observer.disconnect()
  }, [long])

  const view = useMemo(() => {
    if (!long) return { start: 0, end: ordered.length, before: 0, after: 0 }
    /* the spacer height is unknown until the row height arrives, and a short body corrects itself */
    if (metrics.rowHeight === 0) return { start: 0, end: Math.min(ordered.length, FIRST_ROWS), before: 0, after: 0 }

    const visible = Math.ceil(metrics.viewport / metrics.rowHeight)
    const start = Math.max(0, Math.floor(scrollTop / metrics.rowHeight) - OVERSCAN)
    const end = Math.min(ordered.length, start + visible + OVERSCAN * 2)
    return {
      start,
      end,
      before: start * metrics.rowHeight,
      after: (ordered.length - end) * metrics.rowHeight,
    }
  }, [long, metrics, scrollTop, ordered.length])

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (long) setScrollTop(event.currentTarget.scrollTop)
  }

  const cursorIndex = useMemo(() => {
    if (cursor === null) return -1
    return ordered.findIndex((row) => rowId(row) === cursor)
  }, [cursor, ordered, rowId])

  /*
   * the row the cursor is on holds the only tab stop in the body, so leaving the table
   * and coming back returns to it. a pointer scroll can carry that row out of the
   * window, and the first rendered row takes the stop until an arrow moves it again.
   */
  const stop = cursorIndex >= view.start && cursorIndex < view.end ? cursorIndex : view.start

  const moveCursor = (index: number) => {
    const next = ordered[Math.min(Math.max(index, 0), ordered.length - 1)]
    if (next === undefined) return
    chasing.current = true
    setCursor(rowId(next))
  }

  const navigate = (from: number, key: string) => {
    if (key === 'ArrowDown') moveCursor(from + 1)
    if (key === 'ArrowUp') moveCursor(from - 1)
    if (key === 'Home') moveCursor(0)
    if (key === 'End') moveCursor(ordered.length - 1)
  }

  /*
   * a row outside the window does not exist to focus, so the scroll goes first and the
   * effect runs again on the view it produces. `chasing` keeps it off a pointer scroll,
   * which must not pull focus.
   */
  useEffect(() => {
    if (!chasing.current || cursorIndex === -1) return

    const box = scroller.current
    const row = box?.querySelector<HTMLTableRowElement>(`tbody tr[aria-rowindex='${cursorIndex + 2}']`)
    if (row) {
      chasing.current = false
      row.focus({ preventScroll: true })
      row.scrollIntoView({ block: 'nearest' })
      return
    }

    if (box && metrics.rowHeight > 0) {
      const top = cursorIndex * metrics.rowHeight
      const above = top < box.scrollTop
      box.scrollTop = above ? top : top - metrics.viewport + metrics.rowHeight
    }
  }, [cursorIndex, view, metrics])

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
    return (
      <>
        {view.before > 0 && <Spacer span={span} height={view.before} />}
        {ordered.slice(view.start, view.end).map((row, offset) => {
          const id = rowId(row)
          return (
            <Row
              key={id}
              /* the head is row 1, and aria counts from there whatever the window shows */
              rowIndex={view.start + offset + 2}
              position={view.start + offset}
              cursor={view.start + offset === stop}
              onNavigate={navigate}
              row={row}
              id={id}
              columns={columns}
              selected={selected.has(id)}
              onToggle={toggleRow}
              onActivate={onRowActivate}
            />
          )
        })}
        {view.after > 0 && <Spacer span={span} height={view.after} />}
      </>
    )
  }

  return (
    <section className={cx('@container isolate border border-reed bg-raised', className)}>
      <header className="flex items-center justify-between gap-(--stack) border-b border-reed px-(--cell-x) py-(--stack)">
        <h2 className="font-medium">{title}</h2>
        <div className="flex items-center gap-(--stack)">
          {!loading && (
            <p className="text-weft-dim tnum">
              {active.size > 0
                ? `${active.size} of ${rows.length} selected`
                : `${rows.length} ${countNoun(noun, rows.length)}`}
            </p>
          )}
          {actions}
        </div>
      </header>

      <div ref={scroller} onScroll={onScroll} className="reed-scroll max-h-[var(--table-body,32.5rem)] overflow-auto">
        {/* separate borders: a pinned cell paints its background over a collapsed one */}
        <table
          aria-busy={loading}
          aria-rowcount={ordered.length + 1}
          className="w-full table-fixed border-separate border-spacing-0 text-left"
        >
          <thead className="sticky top-0 z-(--z-sticky)">
            <tr ref={headRow} aria-rowindex={1} className="bg-raised select-none">
              <th
                scope="col"
                className="reed-edge warp-line-end sticky left-0 z-(--z-pinned) bg-raised px-(--cell-x)"
                style={{ height: 'var(--row-h)', width: GUTTER }}
              >
                <Checkbox checked={headerState} onCheckedChange={toggleAll} label={`Select all ${countNoun(noun, 2)}`} />
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
