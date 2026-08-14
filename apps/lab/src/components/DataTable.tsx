import { Checkbox } from '@ark-ui/react/checkbox'
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { STATUSES, type Run, type RunStatus } from '../data/runs'
import { CheckIcon } from './icons'

const STATUS_TONE: Record<RunStatus, string> = {
  complete: 'text-jade',
  running: 'text-indigo',
  queued: 'text-weft-faint',
  failed: 'text-madder',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function stamp(iso: string) {
  const [date, time] = iso.split('T')
  const [, month, day] = date.split('-')
  return `${day} ${MONTHS[Number(month) - 1]} ${time}`
}

interface FigureProps {
  readonly value: number
  readonly low?: boolean
}

/* the digits are the content, so anything that is not a digit reads one step back */
const Figure = ({ value, low = false }: FigureProps) => {
  if (value === 0) return <span className="reed-mark" aria-hidden="true" />
  const [whole, fraction] = value.toFixed(1).split('.')
  return (
    <span className={low ? 'reed-under' : undefined}>
      {whole}
      <span className="text-weft-faint">.{fraction}</span>
      {low && <span className="sr-only"> below threshold</span>}
    </span>
  )
}

const Elapsed = ({ minutes }: { readonly minutes: number }) => (
  <>
    {Math.trunc(minutes / 60)}
    <span className="text-weft-faint">h </span>
    {String(minutes % 60).padStart(2, '0')}
    <span className="text-weft-faint">m</span>
  </>
)

/*
 * a column that drops keeps its class literal here, because the tailwind scanner
 * reads the source and never the computed value. the width in the query is the
 * container's, not the viewport's.
 */
const DROP = {
  first: '@max-[1000px]:hidden',
  second: '@max-[860px]:hidden',
  third: '@max-[720px]:hidden',
} as const

const Q30_FLOOR = 80

/* the sort mark is 7px and its gap is 6px, which two characters cover in every density */
const SORT_CHARS = 2

interface Column {
  readonly key: string
  readonly label: string
  readonly unit?: string
  readonly chars: number
  readonly numeric?: boolean
  readonly drop?: string
  readonly sortValue: (run: Run) => string | number
  readonly render: (run: Run) => ReactNode
}

type Direction = 'asc' | 'desc'

interface Sort {
  readonly key: string
  readonly direction: Direction
}

function compare(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function ariaSort(sort: Sort | null, key: string) {
  if (sort?.key !== key) return 'none'
  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

/*
 * a column declares the characters it holds, and the density supplies the rest. the
 * head counts too, because a label and its unit can be longer than the value under
 * it. the count is in the advance of the data face, and the half character covers
 * the rounding that a table layout applies to a column.
 */
function intrinsicWidth(column: Column, sorted: boolean) {
  const unit = column.unit ? column.unit.length + 1 : 0
  const head = column.label.length + unit + (sorted ? SORT_CHARS : 0)
  return `calc(${Math.max(column.chars, head) + 0.5} * var(--data-adv) + var(--cell-x) * 2)`
}

/*
 * the spacer column at the end of the head takes the width that the data columns do
 * not, so a column keeps the width it is given.
 */
const COLUMNS: readonly Column[] = [
  {
    key: 'id',
    label: 'Run',
    chars: 6,
    sortValue: (r) => r.id,
    render: (r) => <span className="font-data text-weft">{r.id}</span>,
  },
  {
    key: 'sample',
    label: 'Sample',
    chars: 10,
    sortValue: (r) => r.sample,
    render: (r) => (
      <span className="font-data" title={r.sample}>
        {r.sample}
      </span>
    ),
  },
  {
    key: 'assay',
    label: 'Assay',
    chars: 8,
    sortValue: (r) => r.assay,
    drop: DROP.third,
    render: (r) => <span className="font-data">{r.assay}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    chars: 10,
    sortValue: (r) => STATUSES.indexOf(r.status),
    render: (r) => (
      <span className={`inline-flex items-center gap-1.5 @max-[780px]:gap-0 ${STATUS_TONE[r.status]}`}>
        <span className={`size-1.25 rounded-full bg-current ${r.status === 'running' ? 'beat' : ''}`} />
        <span className="font-data @max-[780px]:sr-only">{r.status}</span>
      </span>
    ),
  },
  {
    key: 'reads',
    label: 'Reads',
    unit: 'M',
    chars: 5,
    numeric: true,
    sortValue: (r) => r.reads,
    render: (r) => <Figure value={r.reads} />,
  },
  {
    key: 'q30',
    label: 'Q30',
    unit: '%',
    chars: 4,
    numeric: true,
    sortValue: (r) => r.q30,
    render: (r) => <Figure value={r.q30} low={r.q30 > 0 && r.q30 < Q30_FLOOR} />,
  },
  {
    key: 'coverage',
    label: 'Coverage',
    unit: 'x',
    chars: 5,
    numeric: true,
    sortValue: (r) => r.coverage,
    drop: DROP.third,
    render: (r) => <Figure value={r.coverage} />,
  },
  /* a machine value takes the data face, and a human name keeps the interface face */
  {
    key: 'started',
    label: 'Started',
    chars: 12,
    drop: DROP.first,
    sortValue: (r) => r.started,
    render: (r) => <span className="font-data">{stamp(r.started)}</span>,
  },
  {
    key: 'duration',
    label: 'Duration',
    chars: 6,
    numeric: true,
    drop: DROP.second,
    sortValue: (r) => r.duration,
    render: (r) => <Elapsed minutes={r.duration} />,
  },
  {
    key: 'owner',
    label: 'Owner',
    chars: 11,
    drop: DROP.second,
    sortValue: (r) => r.owner,
    render: (r) => r.owner,
  },
]

const MIN_WIDTH = 56
const MAX_WIDTH = 420
const KEY_STEP = 8

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
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
  <span className={`reed-sort text-indigo ${direction === 'desc' ? 'reed-sort-down' : ''}`} aria-hidden="true" />
)

interface ColumnHeadProps {
  readonly column: Column
  readonly sort: Sort | null
  readonly onSort: () => void
}

const ColumnHead = ({ column, sort, onSort }: ColumnHeadProps) => (
  <button
    type="button"
    onClick={onSort}
    className={`flex h-full w-full cursor-pointer items-center gap-1.5 text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft ${
      column.numeric ? 'justify-end' : ''
    }`}
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

const SPAN_ALL = COLUMNS.length + 2

/* the weft arrives one row after another, so each row waits one instant longer than the row above it */
const WarpRows = () => (
  <>
    {SKELETON_IDS.map((id, index) => (
      <tr key={id}>
        <td
          colSpan={SPAN_ALL}
          className="reed-warp reed-warp-beat"
          style={{ height: 'var(--row-h)', animationDelay: `calc(var(--dur-instant) * ${index})` }}
        />
      </tr>
    ))}
  </>
)

/* an empty result is the loom threaded and standing still, so the warp holds and the weft does not come */
const EmptyRow = () => (
  <tr>
    <td
      colSpan={SPAN_ALL}
      className="reed-warp border-t border-reed/60 text-center align-middle text-weft-dim"
      style={{ height: 'calc(var(--row-h) * 4)' }}
    >
      No run matches the filters.
    </td>
  </tr>
)

interface RunRowProps {
  readonly run: Run
  readonly selected: boolean
  readonly onToggle: (id: string) => void
}

/*
 * the row declares every state, and the pinned cell inherits the colour. an opaque
 * hover colour is what allows that, because the pinned cell has to hide the cells
 * that travel under it.
 */
const RunRow = ({ run, selected, onToggle }: RunRowProps) => (
  <tr
    className="bg-raised transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed data-selected:bg-indigo-wash data-selected:hover:bg-indigo-wash"
    data-selected={selected ? '' : undefined}
  >
    <td
      className="warp-line-end sticky left-0 z-(--z-pinned) border-t border-reed/60 bg-inherit px-(--cell-x) transition-colors duration-(--dur-instant) ease-(--ease-beat)"
      style={{ height: 'var(--row-h)' }}
    >
      <Checkbox.Root
        checked={selected}
        onCheckedChange={() => onToggle(run.id)}
        className="ctl-align inline-flex cursor-pointer items-center"
      >
        <Checkbox.Control className="grid size-(--ctl-box) shrink-0 place-items-center border border-reed-lit text-ground transition-colors duration-(--dur-instant) ease-(--ease-beat) data-[state=checked]:border-indigo data-[state=checked]:bg-indigo">
          <Checkbox.Indicator>
            <CheckIcon className="size-2.75" />
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.HiddenInput aria-label={`Select run ${run.id}`} />
      </Checkbox.Root>
    </td>
    {COLUMNS.map((column, index) => (
      <td
        key={column.key}
        className={`truncate border-t border-reed/60 px-(--cell-x) text-weft-dim ${
          index === 0 ? '' : 'warp-line'
        } ${column.drop ?? ''} ${column.numeric ? 'tnum text-right font-data text-weft' : ''}`}
        style={{ height: 'var(--row-h)' }}
      >
        {column.render(run)}
      </td>
    ))}
    <td className="warp-line border-t border-reed/60" />
  </tr>
)

interface DataTableProps {
  readonly rows: readonly Run[]
  readonly loading?: boolean
}

export const DataTable = ({ rows, loading = false }: DataTableProps) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  /* only a column the user dragged holds a px width. the rest follow the density. */
  const [widths, setWidths] = useState<Record<string, number | undefined>>({})

  const [sort, setSort] = useState<Sort | null>(null)

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
    const column = COLUMNS.find((entry) => entry.key === sort?.key)
    if (sort === null || column === undefined) return rows
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compare(column.sortValue(a), column.sortValue(b)))
  }, [rows, sort])

  const headerState = useMemo(() => {
    if (selected.size === 0) return false
    if (selected.size === rows.length) return true
    return 'indeterminate' as const
  }, [selected, rows.length])

  const toggleRow = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((current) => (current.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))))
  }

  const renderBody = () => {
    if (loading) return <WarpRows />
    if (ordered.length === 0) return <EmptyRow />
    return ordered.map((run) => (
      <RunRow key={run.id} run={run} selected={selected.has(run.id)} onToggle={toggleRow} />
    ))
  }

  return (
    <section className="@container border border-reed bg-raised">
      <header className="flex items-center justify-between border-b border-reed px-(--cell-x) py-(--stack)">
        <h2 className="font-medium">Sequencing runs</h2>
        {!loading && (
          <p className="text-weft-dim tnum">
            {selected.size > 0 ? `${selected.size} of ${rows.length} selected` : `${rows.length} runs`}
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
                <Checkbox.Root
                  checked={headerState}
                  onCheckedChange={toggleAll}
                  className="ctl-align inline-flex cursor-pointer items-center"
                >
                  <Checkbox.Control className="grid size-(--ctl-box) shrink-0 place-items-center border border-reed-lit text-ground transition-colors duration-(--dur-instant) ease-(--ease-beat) data-[state=checked]:border-indigo data-[state=checked]:bg-indigo data-[state=indeterminate]:border-indigo data-[state=indeterminate]:bg-indigo">
                    <Checkbox.Indicator>
                      <CheckIcon className="size-2.75" />
                    </Checkbox.Indicator>
                    <Checkbox.Indicator indeterminate>
                      <span className="block h-px w-1.75 bg-current" />
                    </Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.HiddenInput aria-label="Select all runs" />
                </Checkbox.Root>
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort(sort, column.key)}
                  className={`reed-edge px-(--cell-x) font-medium ${column.drop ?? ''}`}
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
