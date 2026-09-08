import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
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

export type SortDirection = 'asc' | 'desc'

export interface Sort {
  readonly key: string
  readonly direction: SortDirection
}

const MIN_WIDTH = 56
const MAX_WIDTH = 420
const KEY_STEP = 8

/* the 7px mark and its 6px gap: two characters cover both in every density */
const SORT_CHARS = 2

/*
 * a press travelling this far is a column being moved rather than a column being sorted. it is
 * wide enough that the travel in an ordinary click cannot reach it, since a press that arms the
 * drag is a press that no longer sorts.
 */
const MOVE_THRESHOLD = 8

/*
 * the column the pointer carries travels above its neighbours, so it needs the row's own
 * background: a transparent cell would let the values underneath read through it. that is the
 * pinned cell's problem and this is the pinned cell's answer. it takes the leading divider its
 * own cells draw as well, or the head arrives over its neighbours as a smear with no edge.
 */
const CARRIED = 'warp-line relative z-(--z-grip) cursor-grabbing bg-inherit'

/* the columns it passes step aside, which is the one place the table animates its layout */
const SLIDING = 'transition-[translate] duration-(--dur-local) ease-(--ease-beat)'

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

/* one column at a time, and the third press restores the order the rows arrived in */
function cycleSort(sort: Sort | null, key: string): Sort | null {
  if (sort?.key !== key) return { key, direction: 'asc' }
  if (sort.direction === 'asc') return { key, direction: 'desc' }
  return null
}

/*
 * the held order is a preference and not the list itself. a column the caller drops falls
 * out, a column it adds lands at the end, and a column that comes back returns to the place
 * it held.
 */
function ordering<T>(columns: readonly Column<T>[], order: readonly string[]) {
  const byKey = new Map(columns.map((column) => [column.key, column]))
  const held = order.map((key) => byKey.get(key)).filter((column) => column !== undefined)
  return [...held, ...columns.filter((column) => !order.includes(column.key))]
}

/*
 * `to` is an insertion point in the list as it stands, which is how a drop between two
 * columns is expressed. the first data column names the row and is pinned there, so nothing
 * lands in front of it, and a move onto either side of where the column already sits is no
 * move at all.
 */
function moveColumn(keys: readonly string[], key: string, to: number): readonly string[] {
  const from = keys.indexOf(key)
  const at = Math.min(Math.max(to, 1), keys.length)
  if (from === -1 || at === from || at === from + 1) return keys
  const rest = keys.filter((entry) => entry !== key)
  const landing = at > from ? at - 1 : at
  return [...rest.slice(0, landing), key, ...rest.slice(landing)]
}

/*
 * a column being moved: where it started, the boundary it would land on, its own width, and
 * how far the pointer has carried it. the width is what every other column steps aside by.
 */
interface Drag {
  readonly key: string
  readonly from: number
  readonly to: number
  readonly width: number
  readonly dx: number
}

/*
 * a caller that passes the value and its callback owns that piece of state, and a caller
 * that passes neither gets the table's own. every setter takes the whole next value, so a
 * controlled caller never has to read the table back to know what it holds.
 */
function useHeld<T>(value: T | undefined, onChange: ((next: T) => void) | undefined, initial: T) {
  const [inner, setInner] = useState(initial)
  const set = (next: T) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  /* undefined is the only absence: a caller can hold null, which is a sort of nothing */
  return [value === undefined ? inner : value, set] as const
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
function intrinsicWidth<T>(column: Column<T>, reserved: number) {
  const unit = column.unit ? column.unit.length + 1 : 0
  const head = column.label.length + unit + reserved
  const value = `${column.chars + 0.5} * var(--data-adv)`
  const label = `${head + 0.5} * max(var(--data-adv), 1ch)`
  return `calc(max(${value}, ${label}) + var(--cell-x) * 2)`
}

/* what the head reserves for its mark, and only while it carries one */
function headChars(direction: SortDirection | undefined) {
  return direction === undefined ? 0 : SORT_CHARS
}

interface ColumnGripProps {
  readonly label: string
  readonly onResize: (next: number) => void
  /* the grip is the column's handle for both its size and its place */
  readonly onNudge: (by: number) => void
}

/* the width on screen. a column that never moved holds no px of its own. */
const cellWidth = (grip: HTMLButtonElement) => grip.parentElement?.offsetWidth ?? 0

const ColumnGrip = ({ label, onResize, onNudge }: ColumnGripProps) => {
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
    const by = event.key === 'ArrowLeft' ? -1 : 1
    /* the same pair with shift moves the column instead, one place a press */
    if (event.shiftKey) {
      onNudge(by)
      return
    }
    onResize(cellWidth(event.currentTarget) + by * KEY_STEP)
  }

  return (
    <button
      type="button"
      aria-label={`Resize or move the ${label} column`}
      data-grip=""
      className="reed-grip"
      data-dragging={dragging ? '' : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onLostPointerCapture={() => setDragging(false)}
      onKeyDown={onKeyDown}
    />
  )
}

const SortMark = ({ direction }: { readonly direction: SortDirection }) => (
  <span className={cx('reed-sort text-indigo', direction === 'desc' && 'reed-sort-down')} aria-hidden="true" />
)

interface ColumnHeadProps<T> {
  readonly column: Column<T>
  readonly direction?: SortDirection
  /* raised while the press on this head is carrying the column somewhere */
  readonly dragged: RefObject<boolean>
  readonly onSort: () => void
}

const ColumnHead = <T,>({ column, direction, dragged, onSort }: ColumnHeadProps<T>) => {
  const shell = cx('flex h-full w-full items-center gap-1.5 text-weft-dim', column.numeric && 'justify-end')
  /* the mark sits inside the baseline group, standing on the baseline of the label */
  const label = (
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      <span className="truncate">{column.label}</span>
      {column.unit && <span className="font-data text-weft-faint">{column.unit}</span>}
      {direction && <SortMark direction={direction} />}
    </span>
  )

  const head = column.sortValue ? (
    <button
      type="button"
      /*
       * a press that armed the drag is not a sort, however the browser routes the click that
       * follows it. a key press reports no click count, which is the one click that always is.
       */
      onClick={(event) => {
        if (event.detail > 0 && dragged.current) return
        onSort()
      }}
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
      <div className="table-empty">
        <EmptyState title={message} />
      </div>
    </td>
  </tr>
)

const NAV_KEYS: ReadonlySet<string> = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

/* a control in a cell owns its own click, and the checkbox sits inside a label */
const INTERACTIVE = 'a, button, input, select, textarea, label'

interface Move {
  /* the column the pointer carries, by its place in the drawn order */
  readonly index: number
  /* one step for each column, in page pixels */
  readonly shifts: readonly number[]
}

interface RowProps<T> {
  readonly row: T
  readonly id: string
  readonly columns: readonly Column<T>[]
  readonly move: Move | null
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
  move,
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
            move !== null && (move.index === index ? CARRIED : SLIDING),
          )}
          style={{
            height: 'var(--row-h)',
            left: index === 0 ? GUTTER : undefined,
            translate: move === null ? undefined : `${move.shifts[index]}px`,
          }}
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
  /*
   * the three pieces of state a reader sets and an application may want to keep. pass one
   * with its callback to own it, or leave both out and the table holds it.
   */
  readonly sort?: Sort | null
  readonly onSortChange?: (sort: Sort | null) => void
  readonly widths?: Readonly<Record<string, number | undefined>>
  readonly onWidthsChange?: (widths: Readonly<Record<string, number | undefined>>) => void
  readonly order?: readonly string[]
  readonly onOrderChange?: (order: readonly string[]) => void
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
  sort: sortProp,
  onSortChange,
  widths: widthsProp,
  onWidthsChange,
  order: orderProp,
  onOrderChange,
  onSelectionChange,
  onRowActivate,
  className,
}: TableProps<T>) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  /* only a dragged column holds a px width; the rest follow the density */
  const [widths, setWidths] = useHeld<Readonly<Record<string, number | undefined>>>(widthsProp, onWidthsChange, {})
  const [sort, setSort] = useHeld<Sort | null>(sortProp, onSortChange, null)
  const [order, setOrder] = useHeld<readonly string[]>(orderProp, onOrderChange, [])
  const [cursor, setCursor] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)

  /* raised by a key press, so the focus chase below ignores a scroll the pointer made */
  const chasing = useRef(false)

  const drawn = useMemo(() => ordering(columns, order), [columns, order])
  const keys = useMemo(() => drawn.map((column) => column.key), [drawn])

  const span = drawn.length + 2

  const resizeColumn = (key: string, next: number) => {
    setWidths({ ...widths, [key]: clampWidth(next) })
  }

  /* one place a press, from the grip that also carries the width */
  const nudgeColumn = (key: string, by: number) => {
    const index = keys.indexOf(key)
    setOrder(moveColumn(keys, key, by > 0 ? index + 2 : index - 1))
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

  /* the empty message holds to the visible width, which only the box itself can report */
  useEffect(() => {
    const box = scroller.current
    if (!box || ordered.length > 0) return undefined

    const read = () => box.style.setProperty('--table-view', `${box.clientWidth}px`)
    read()

    const observer = new ResizeObserver(read)
    observer.observe(box)
    return () => observer.disconnect()
  }, [ordered.length])

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

  /* the column the pointer carries, and the whole row of steps its neighbours take */
  const shiftOf = (index: number) => {
    if (drag === null) return 0
    if (index === drag.from) return drag.dx
    if (drag.to <= index && index < drag.from) return drag.width
    if (drag.from < index && index < drag.to) return -drag.width
    return 0
  }

  const move = drag === null ? null : { index: drag.from, shifts: keys.map((_, index) => shiftOf(index)) }


  const headCells = () => [...(headRow.current?.querySelectorAll<HTMLTableCellElement>('th[data-column]') ?? [])]

  /*
   * the head cells are read on every move rather than once, since a sideways scroll under the
   * drag would leave a cached geometry naming the wrong boundary. the step each one has taken
   * comes off its rect again, or a boundary would move as the reader crossed it and the
   * landing would flicker between two columns. the first data column is pinned where it is,
   * so the earliest landing is in front of the second.
   */
  const dropAt = (x: number) => {
    const cells = headCells()
    for (const [index, cell] of cells.entries()) {
      const box = cell.getBoundingClientRect()
      const left = box.left - shiftOf(index)
      if (x >= left + box.width) continue
      return Math.max(1, x < left + box.width / 2 ? index : index + 1)
    }
    return cells.length
  }

  /*
   * the column travels inside what the reader can see, so a sideways scrolled table cannot carry
   * it under the pinned pair, where an opaque cell of a higher rank would swallow it whole.
   */
  const travelLimits = (cell: HTMLTableCellElement) => {
    const cells = headCells()
    const box = cell.getBoundingClientRect()
    const visible = scroller.current?.getBoundingClientRect()
    const pinned = cells.at(0)?.getBoundingClientRect()
    const last = cells.at(-1)?.getBoundingClientRect()
    if (visible === undefined || pinned === undefined || last === undefined) return { min: 0, max: 0 }
    return {
      min: Math.min(0, Math.max(pinned.right, visible.left) - box.left),
      max: Math.max(0, Math.min(last.right, visible.right) - box.right),
    }
  }

  /*
   * the capture is taken on the first move past the threshold and not on the press, which
   * leaves a plain press as a press: chrome dispatches the click to the capturing element,
   * so a captured head would swallow the sort its own button was waiting for.
   */
  const origin = useRef<number | null>(null)
  const limits = useRef({ min: 0, max: 0 })
  /* raised the moment a press becomes a drag, and read by the head it started on */
  const dragged = useRef(false)

  /* a press that starts on the grip belongs to the width, and its moves reach this cell too */
  const startMove = (event: PointerEvent<HTMLTableCellElement>) => {
    const onGrip = event.target instanceof Element && event.target.closest('[data-grip]') !== null
    dragged.current = false
    origin.current = onGrip || event.button !== 0 ? null : event.clientX
  }

  /*
   * a move arrives whether a button is held or not, so a drag runs only while one is: an origin
   * a plain press left behind would carry the column off on the next move across the cell.
   */
  const trackMove = (key: string) => (event: PointerEvent<HTMLTableCellElement>) => {
    const cell = event.currentTarget
    const start = origin.current
    if (event.buttons === 0) {
      if (!cell.hasPointerCapture(event.pointerId)) origin.current = null
      return
    }
    if (!cell.hasPointerCapture(event.pointerId)) {
      if (start === null || Math.abs(event.clientX - start) < MOVE_THRESHOLD) return
      cell.setPointerCapture(event.pointerId)
      dragged.current = true
      /* read before the first step is painted, so the room to travel is the layout's own */
      limits.current = travelLimits(cell)
    }
    if (start === null) return
    const dx = Math.min(Math.max(event.clientX - start, limits.current.min), limits.current.max)
    setDrag({ key, from: keys.indexOf(key), to: dropAt(event.clientX), width: cell.offsetWidth, dx })
  }

  /* the press that sorted is over, and it leaves nothing behind for a later move to pick up */
  const dropMove = () => {
    origin.current = null
  }

  /* the release decides, so a move and a release inside one frame cannot land a boundary late */
  const endMove = (key: string) => (event: PointerEvent<HTMLTableCellElement>) => {
    setOrder(moveColumn(keys, key, dropAt(event.clientX)))
    origin.current = null
    setDrag(null)
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
              columns={drawn}
              move={move}
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
              {drawn.map((column, index) => {
                const sorted = sort?.key === column.key ? sort.direction : undefined
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort(sort, column)}
                    data-column={column.key}
                    onPointerDown={index === 0 ? undefined : startMove}
                    onPointerMove={index === 0 ? undefined : trackMove(column.key)}
                    onPointerUp={index === 0 ? undefined : dropMove}
                    onLostPointerCapture={index === 0 ? undefined : endMove(column.key)}
                    className={cx(
                      'reed-edge px-(--cell-x) font-medium',
                      index === 0 && 'warp-line-end sticky z-(--z-pinned) bg-raised',
                      move !== null && (move.index === index ? CARRIED : SLIDING),
                    )}
                    style={{
                      height: 'var(--row-h)',
                      left: index === 0 ? GUTTER : undefined,
                      width: widths[column.key] ?? intrinsicWidth(column, headChars(sorted)),
                      translate: move === null ? undefined : `${move.shifts[index]}px`,
                    }}
                  >
                    <ColumnHead
                      column={column}
                      direction={sorted}
                      dragged={dragged}
                      onSort={() => setSort(cycleSort(sort, column.key))}
                    />
                    <ColumnGrip
                      label={column.label}
                      onResize={(next) => resizeColumn(column.key, next)}
                      onNudge={(by) => nudgeColumn(column.key, by)}
                    />
                  </th>
                )
              })}
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
