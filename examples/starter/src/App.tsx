import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { FilterBar, type FilterGroup, type FilterValues } from '@/components/ui/filter-bar/FilterBar'
import { Table, type Column } from '@/components/ui/table/Table'
import { ASSAYS, runs, STATUSES, type Run } from './data/runs'

const DENSITIES = ['comfortable', 'compact', 'dense'] as const
type Density = (typeof DENSITIES)[number]

const TONE: Record<Run['status'], string> = {
  complete: 'text-jade',
  running: 'text-indigo',
  queued: 'text-weft-dim',
  failed: 'text-madder',
}

const Status = ({ status }: { readonly status: Run['status'] }) => (
  <span className={`ctl-align inline-flex items-center gap-2 ${TONE[status]}`}>
    <span className={`size-1.25 rounded-full bg-current ${status === 'running' ? 'beat' : ''}`} />
    <span className="font-data">{status}</span>
  </span>
)

/* the integer reads first, so the digits after the point step back */
const Figure = ({ value, places = 1 }: { readonly value: number; readonly places?: number }) => {
  if (value === 0) return <span className="reed-mark" aria-label="no value" />
  const [whole, fraction] = value.toFixed(places).split('.')
  return (
    <span className="tnum font-data">
      {whole}
      <span className="text-weft-faint">.{fraction}</span>
    </span>
  )
}

const COLUMNS: readonly Column<Run>[] = [
  { key: 'id', label: 'Run', chars: 8, sortValue: (r) => r.id, render: (r) => <span className="font-data">{r.id}</span> },
  { key: 'sample', label: 'Sample', chars: 12, sortValue: (r) => r.sample, render: (r) => <span className="font-data">{r.sample}</span> },
  { key: 'assay', label: 'Assay', chars: 9, sortValue: (r) => r.assay, render: (r) => r.assay },
  { key: 'status', label: 'Status', chars: 10, sortValue: (r) => r.status, render: (r) => <Status status={r.status} /> },
  { key: 'reads', label: 'Reads', unit: 'M', chars: 7, numeric: true, sortValue: (r) => r.reads, render: (r) => <Figure value={r.reads} /> },
  { key: 'q30', label: 'Q30', unit: '%', chars: 6, numeric: true, sortValue: (r) => r.q30, render: (r) => <Figure value={r.q30} /> },
  { key: 'owner', label: 'Owner', chars: 12, sortValue: (r) => r.owner, render: (r) => r.owner },
]

/* the group carries how to read its own value off a row, so the filter needs no cast */
interface RunFilter extends FilterGroup {
  readonly pick: (run: Run) => string
}

const GROUPS: readonly RunFilter[] = [
  { key: 'assay', label: 'Assay', options: [...ASSAYS], pick: (run) => run.assay },
  { key: 'status', label: 'Status', options: [...STATUSES], pick: (run) => run.status },
]

export const App = () => {
  const [density, setDensity] = useState<Density>('comfortable')

  /* the density tokens are declared on :root, so the attribute belongs on the html element */
  useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])
  const [query, setQuery] = useState('')
  const [values, setValues] = useState<FilterValues>({})

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return runs.filter((run) => {
      for (const group of GROUPS) {
        const chosen = values[group.key]
        if (chosen?.length && !chosen.includes(group.pick(run))) return false
      }
      if (!needle) return true
      return `${run.id} ${run.sample} ${run.owner}`.toLowerCase().includes(needle)
    })
  }, [query, values])

  return (
    <div className="min-h-dvh bg-ground text-weft">
      <div className="mx-auto flex max-w-6xl flex-col gap-(--stack) p-6">
        <header className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-ui text-[22px] font-semibold tracking-[-0.02em]">Sequencing runs</h1>
            <p className="text-weft-dim">
              Every control below reads the density. Change it and nothing goes out of step.
            </p>
          </div>
          <div className="flex gap-2">
            {DENSITIES.map((option) => (
              <Button
                key={option}
                variant={option === density ? 'primary' : 'default'}
                onClick={() => setDensity(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </header>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          groups={GROUPS}
          values={values}
          onValuesChange={setValues}
          placeholder="Search a run, a sample or an owner"
        />

        <Table
          rows={shown}
          columns={COLUMNS}
          rowId={(run) => run.id}
          title="Runs"
          noun={['run', 'runs']}
          emptyMessage="No run matches that filter."
        />
      </div>
    </div>
  )
}
