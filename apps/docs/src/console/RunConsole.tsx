import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { FilterBar, type FilterValues } from '@/components/ui/filter-bar/FilterBar'
import { Table } from '@/components/ui/table/Table'
import { CancelDialog } from '@demo/CancelDialog'
import { ColumnMenu } from '@demo/ColumnMenu'
import { RunPanel } from '@demo/RunPanel'
import { runColumns } from '@demo/columns'
import { RUN_GROUPS, matchesFilters } from '@demo/filters'
import { STATUSES, runs, type Run } from '@demo/runs'
import { STATUS_TONE } from '@demo/status'
import { toaster } from '@demo/toaster'

const Tally = ({ rows }: { readonly rows: readonly Run[] }) => (
  <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
    {STATUSES.map((status) => (
      <div key={status} className="flex items-baseline gap-1.5">
        <span className={`size-1.25 translate-y-[-2px] rounded-full bg-current ${STATUS_TONE[status]}`} />
        <dt className="text-weft-dim">{status}</dt>
        <dd className="tnum font-data text-weft">{rows.filter((run) => run.status === status).length}</dd>
      </div>
    ))}
  </dl>
)

export const RunConsole = () => {
  const [query, setQuery] = useState('')
  const [values, setValues] = useState<FilterValues>({})
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<Run | null>(null)
  const [pending, setPending] = useState<Run | null>(null)
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set())
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())

  const visible = useMemo(() => runs.filter((run) => matchesFilters(run, query, values)), [query, values])
  const exportable = useMemo(() => visible.filter((run) => selected.has(run.id)).length, [visible, selected])

  const allColumns = useMemo(() => runColumns(setDetail), [])
  const columns = useMemo(() => allColumns.filter((column) => !hidden.has(column.key)), [allColumns, hidden])

  const toggleColumn = (key: string) => {
    setHidden((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      return next
    })
  }

  const cancelRun = (run: Run) => {
    setPending(null)
    setDetail(null)
    toaster.create({
      title: `${run.id} is cancelled`,
      description: 'The instrument has stopped, and the reads stay on the run.',
      type: 'warning',
    })
  }

  return (
    <div className="flex flex-col gap-(--stack)">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Tally rows={visible} />
        <Button variant="quiet" onClick={() => setLoading((current) => !current)}>
          {loading ? 'Show the rows' : 'Show the loading state'}
        </Button>
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        groups={RUN_GROUPS}
        values={values}
        onValuesChange={setValues}
        searchLabel="Search runs"
        placeholder="Search runs, samples, owners"
      />

      <Table
        rows={visible}
        columns={columns}
        rowId={(run) => run.id}
        title="Sequencing runs"
        noun="runs"
        emptyMessage="No run matches the filters."
        loading={loading}
        onSelectionChange={setSelected}
        actions={
          <>
            {exportable > 0 && (
              <Button
                onClick={() =>
                  toaster.create({
                    title: `${exportable} ${exportable === 1 ? 'run is' : 'runs are'} queued for export`,
                    type: 'success',
                  })
                }
              >
                Export
              </Button>
            )}
            <ColumnMenu columns={allColumns} hidden={hidden} onToggle={toggleColumn} />
          </>
        }
      />

      <RunPanel run={detail} onClose={() => setDetail(null)} onCancelRun={setPending} />
      <CancelDialog run={pending} onClose={() => setPending(null)} onConfirm={cancelRun} />
    </div>
  )
}
