import { Checkbox } from '@ark-ui/react/checkbox'
import { useMemo, useState, type ReactNode } from 'react'
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
  readonly width: string
  readonly numeric?: boolean
  readonly render: (run: Run) => ReactNode
}

const COLUMNS: readonly Column[] = [
  { key: 'id', label: 'Run', width: 'w-[76px]', render: (r) => <span className="font-data text-weft">{r.id}</span> },
  { key: 'sample', label: 'Sample', width: 'w-[124px]', render: (r) => <span className="font-data">{r.sample}</span> },
  { key: 'assay', label: 'Assay', width: 'w-[92px]', render: (r) => r.assay },
  {
    key: 'status',
    label: 'Status',
    width: 'w-[104px]',
    render: (r) => (
      <span className={`inline-flex items-center gap-1.5 ${STATUS_TONE[r.status]}`}>
        <span className={`size-[5px] rounded-full bg-current ${r.status === 'running' ? 'beat' : ''}`} />
        {r.status}
      </span>
    ),
  },
  { key: 'reads', label: 'Reads (M)', width: 'w-[86px]', numeric: true, render: (r) => figure(r.reads) },
  { key: 'q30', label: 'Q30 %', width: 'w-[72px]', numeric: true, render: (r) => figure(r.q30) },
  { key: 'coverage', label: 'Coverage', width: 'w-[82px]', numeric: true, render: (r) => figure(r.coverage) },
  { key: 'started', label: 'Started', width: 'w-[110px]', render: (r) => r.started },
  { key: 'duration', label: 'Duration', width: 'w-[82px]', numeric: true, render: (r) => r.duration },
  { key: 'owner', label: 'Owner', width: 'w-[110px]', render: (r) => r.owner },
]

interface DataTableProps {
  readonly rows: readonly Run[]
}

export const DataTable = ({ rows }: DataTableProps) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())

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
      <header className="flex items-center justify-between border-b border-reed px-[var(--cell-x)] py-[var(--stack)]">
        <h2 className="font-medium">Sequencing runs</h2>
        <p className="text-weft-dim tnum">
          {selected.size > 0 ? `${selected.size} of ${rows.length} selected` : `${rows.length} runs`}
        </p>
      </header>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="sticky top-0 z-[var(--z-sticky)]">
            <tr className="bg-raised">
              <th scope="col" className="reed-edge w-[34px] px-[var(--cell-x)] align-middle">
                <Checkbox.Root
                  checked={headerState}
                  onCheckedChange={toggleAll}
                  className="flex cursor-pointer items-center"
                >
                  <Checkbox.Control className="grid size-[13px] place-items-center border border-reed-lit text-ground transition-colors duration-[var(--dur-instant)] ease-[var(--ease-beat)] data-[state=checked]:border-indigo data-[state=checked]:bg-indigo data-[state=indeterminate]:border-indigo data-[state=indeterminate]:bg-indigo">
                    <Checkbox.Indicator>
                      <CheckIcon className="size-[11px]" />
                    </Checkbox.Indicator>
                    <Checkbox.Indicator indeterminate>
                      <span className="block h-px w-[7px] bg-current" />
                    </Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.HiddenInput aria-label="Select all runs" />
                </Checkbox.Root>
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`reed-edge px-[var(--cell-x)] font-medium text-weft-dim ${column.width} ${
                    column.numeric ? 'text-right' : ''
                  }`}
                  style={{ height: 'var(--row-h)' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((run) => (
              <tr
                key={run.id}
                className="border-t border-reed/60 transition-colors duration-[var(--dur-instant)] ease-[var(--ease-beat)] hover:bg-indigo-wash data-[selected]:bg-indigo-wash"
                data-selected={selected.has(run.id) ? '' : undefined}
              >
                <td className="px-[var(--cell-x)] align-middle" style={{ height: 'var(--row-h)' }}>
                  <Checkbox.Root
                    checked={selected.has(run.id)}
                    onCheckedChange={() => toggleRow(run.id)}
                    className="flex cursor-pointer items-center"
                  >
                    <Checkbox.Control className="grid size-[13px] place-items-center border border-reed-lit text-ground transition-colors duration-[var(--dur-instant)] ease-[var(--ease-beat)] data-[state=checked]:border-indigo data-[state=checked]:bg-indigo">
                      <Checkbox.Indicator>
                        <CheckIcon className="size-[11px]" />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.HiddenInput aria-label={`Select run ${run.id}`} />
                  </Checkbox.Root>
                </td>
                {COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className={`truncate px-[var(--cell-x)] text-weft-dim ${
                      column.numeric ? 'tnum text-right font-data text-weft' : ''
                    }`}
                    style={{ height: 'var(--row-h)' }}
                  >
                    {column.render(run)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
