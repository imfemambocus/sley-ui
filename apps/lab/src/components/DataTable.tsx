import { Checkbox } from '@ark-ui/react/checkbox'
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import type { Run, RunStatus } from '../data/runs'
import { CheckIcon } from './icons'

const STATUS_TONE: Record<RunStatus, string> = {
  complete: 'text-jade',
  running: 'text-indigo',
  queued: 'text-weft-faint',
  failed: 'text-madder',
}

const NO_VALUE = '-'

function figure(value: number, digits = 1) {
  if (value === 0) return NO_VALUE
  return value.toFixed(digits)
}

interface Column {
  readonly key: string
  readonly label: string
  readonly width: number
  readonly numeric?: boolean
  readonly render: (run: Run) => ReactNode
}

/*
 * a resizable width is a px number and not a spacing step, because a pointer delta
 * is px. the spacer column at the end of the head takes the width that the data
 * columns do not, so a column keeps the width it is given.
 */
const COLUMNS: readonly Column[] = [
  { key: 'id', label: 'Run', width: 76, render: (r) => <span className="font-data text-weft">{r.id}</span> },
  { key: 'sample', label: 'Sample', width: 124, render: (r) => <span className="font-data">{r.sample}</span> },
  { key: 'assay', label: 'Assay', width: 92, render: (r) => r.assay },
  {
    key: 'status',
    label: 'Status',
    width: 104,
    render: (r) => (
      <span className={`inline-flex items-center gap-1.5 ${STATUS_TONE[r.status]}`}>
        <span className={`size-1.25 rounded-full bg-current ${r.status === 'running' ? 'beat' : ''}`} />
        {r.status}
      </span>
    ),
  },
  { key: 'reads', label: 'Reads (M)', width: 86, numeric: true, render: (r) => figure(r.reads) },
  { key: 'q30', label: 'Q30 %', width: 72, numeric: true, render: (r) => figure(r.q30) },
  { key: 'coverage', label: 'Coverage', width: 82, numeric: true, render: (r) => figure(r.coverage) },
  { key: 'started', label: 'Started', width: 110, render: (r) => r.started },
  { key: 'duration', label: 'Duration', width: 82, numeric: true, render: (r) => r.duration },
  { key: 'owner', label: 'Owner', width: 110, render: (r) => r.owner },
]

const MIN_WIDTH = 56
const MAX_WIDTH = 420
const KEY_STEP = 8

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
}

interface ColumnGripProps {
  readonly label: string
  readonly width: number
  readonly onResize: (next: number) => void
}

const ColumnGrip = ({ label, width, onResize }: ColumnGripProps) => {
  const originX = useRef(0)
  const originWidth = useRef(0)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    originX.current = event.clientX
    originWidth.current = width
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    onResize(originWidth.current + event.clientX - originX.current)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    onResize(event.key === 'ArrowLeft' ? width - KEY_STEP : width + KEY_STEP)
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

const SKELETON_IDS: readonly string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => `warp-${id}`)

/* the weft arrives one row after another, so each row waits one instant longer than the row above it */
const WarpRows = () => (
  <>
    {SKELETON_IDS.map((id, index) => (
      <tr key={id}>
        <td
          colSpan={COLUMNS.length + 2}
          className="reed-warp"
          style={{ height: 'var(--row-h)', animationDelay: `calc(var(--dur-instant) * ${index})` }}
        />
      </tr>
    ))}
  </>
)

interface RunRowProps {
  readonly run: Run
  readonly selected: boolean
  readonly onToggle: (id: string) => void
}

const RunRow = ({ run, selected, onToggle }: RunRowProps) => (
  <tr
    className="group transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-indigo-wash data-selected:bg-indigo-wash"
    data-selected={selected ? '' : undefined}
  >
    <td
      className="warp-line-end sticky left-0 z-(--z-pinned) border-t border-reed/60 bg-raised px-(--cell-x) align-middle transition-colors duration-(--dur-instant) ease-(--ease-beat) group-hover:bg-indigo-wash group-data-selected:bg-indigo-wash"
      style={{ height: 'var(--row-h)' }}
    >
      <Checkbox.Root
        checked={selected}
        onCheckedChange={() => onToggle(run.id)}
        className="flex cursor-pointer items-center"
      >
        <Checkbox.Control className="grid size-3.25 place-items-center border border-reed-lit text-ground transition-colors duration-(--dur-instant) ease-(--ease-beat) data-[state=checked]:border-indigo data-[state=checked]:bg-indigo">
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
        } ${column.numeric ? 'tnum text-right font-data text-weft' : ''}`}
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
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(COLUMNS.map((column) => [column.key, column.width] as const)),
  )

  const resizeColumn = (key: string, next: number) => {
    setWidths((current) => ({ ...current, [key]: clampWidth(next) }))
  }

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

  return (
    <section className="border border-reed bg-raised">
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
              <th
                scope="col"
                className="reed-edge warp-line-end sticky left-0 z-(--z-pinned) w-8.5 bg-raised px-(--cell-x) align-middle"
              >
                <Checkbox.Root
                  checked={headerState}
                  onCheckedChange={toggleAll}
                  className="flex cursor-pointer items-center"
                >
                  <Checkbox.Control className="grid size-3.25 place-items-center border border-reed-lit text-ground transition-colors duration-(--dur-instant) ease-(--ease-beat) data-[state=checked]:border-indigo data-[state=checked]:bg-indigo data-[state=indeterminate]:border-indigo data-[state=indeterminate]:bg-indigo">
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
                  className={`reed-edge px-(--cell-x) font-medium text-weft-dim ${
                    column.numeric ? 'text-right' : ''
                  }`}
                  style={{ height: 'var(--row-h)', width: widths[column.key] }}
                >
                  {column.label}
                  <ColumnGrip
                    label={column.label}
                    width={widths[column.key]}
                    onResize={(next) => resizeColumn(column.key, next)}
                  />
                </th>
              ))}
              <th scope="col" className="reed-edge">
                <span className="sr-only">Spare width</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && <WarpRows />}
            {!loading &&
              rows.map((run) => (
                <RunRow key={run.id} run={run} selected={selected.has(run.id)} onToggle={toggleRow} />
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
