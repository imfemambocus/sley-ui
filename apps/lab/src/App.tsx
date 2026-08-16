import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { CommandPalette, type Command } from '@/components/ui/command-palette/CommandPalette'
import { FilterBar, type FilterValues } from '@/components/ui/filter-bar/FilterBar'
import { Table } from '@/components/ui/table/Table'
import { Toaster } from '@/components/ui/toast/Toast'
import { CancelDialog } from '@demo/CancelDialog'
import { ColumnMenu } from '@demo/ColumnMenu'
import { RunPanel } from '@demo/RunPanel'
import { runColumns } from '@demo/columns'
import { RUN_GROUPS, matchesFilters } from '@demo/filters'
import { longRuns, runs, type Run } from '@demo/runs'
import { toaster } from '@demo/toaster'

const DENSITIES = ['comfortable', 'compact', 'dense'] as const
type Density = (typeof DENSITIES)[number]

const THEMES = ['dark', 'light'] as const
type Theme = (typeof THEMES)[number]

const KNOBS = ['--row-h', '--cell-x', '--ui-text', '--ctl-h', '--stack', '--reed-pitch'] as const

const LONG_ROWS = 1000
const LOAD_MS = 450

interface Knob {
  readonly name: string
  readonly value: string
}

interface SegmentedProps<T extends string> {
  readonly legend: string
  readonly options: readonly T[]
  readonly value: T
  readonly onSelect: (next: T) => void
}

const Segmented = <T extends string>({ legend, options, value, onSelect }: SegmentedProps<T>) => (
  <fieldset className="flex items-center border border-reed">
    <legend className="sr-only">{legend}</legend>
    {options.map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={option === value}
        onClick={() => onSelect(option)}
        className="h-(--ctl-h) cursor-pointer px-(--cell-x) text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft aria-pressed:bg-indigo-wash aria-pressed:text-weft"
      >
        {option}
      </button>
    ))}
  </fieldset>
)

export const App = () => {
  const [density, setDensity] = useState<Density>('compact')
  const [theme, setTheme] = useState<Theme>('dark')
  const [query, setQuery] = useState('')
  const [values, setValues] = useState<FilterValues>({})
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [long, setLong] = useState(false)
  const [source, setSource] = useState<readonly Run[]>(runs)
  const [knobs, setKnobs] = useState<readonly Knob[]>([])
  const [detail, setDetail] = useState<Run | null>(null)
  const [pending, setPending] = useState<Run | null>(null)
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set())
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    const root = document.documentElement
    root.dataset.density = density
    root.dataset.theme = theme
    const style = getComputedStyle(root)
    setKnobs(KNOBS.map((token) => ({ name: token.slice(2), value: style.getPropertyValue(token).trim() })))
  }, [density, theme])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k') return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      setPaletteOpen((open) => !open)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  /* the batch is built in memory, and the pause stands in for the fetch a real application makes */
  const toggleLong = useCallback(() => {
    const next = !long
    setLong(next)
    setLoading(true)
    window.setTimeout(() => {
      setSource(next ? longRuns(LONG_ROWS) : runs)
      setLoading(false)
    }, LOAD_MS)
  }, [long])

  const visible = useMemo(() => source.filter((run) => matchesFilters(run, query, values)), [source, query, values])

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

  const commands: readonly Command[] = useMemo(
    () => [
      ...DENSITIES.map((option) => ({
        id: `density-${option}`,
        group: 'Density',
        label: `Set density to ${option}`,
        run: () => setDensity(option),
      })),
      ...THEMES.map((option) => ({
        id: `theme-${option}`,
        group: 'Appearance',
        label: `Switch to ${option}`,
        run: () => setTheme(option),
      })),
      {
        id: 'filter-running',
        group: 'Filters',
        label: 'Show running runs only',
        run: () => setValues({ status: ['running'] }),
      },
      {
        id: 'filter-failed',
        group: 'Filters',
        label: 'Show failed runs only',
        run: () => setValues({ status: ['failed'] }),
      },
      {
        id: 'filter-clear',
        group: 'Filters',
        label: 'Clear all filters',
        run: () => setValues({}),
      },
      {
        id: 'table-loading',
        group: 'Table',
        label: 'Toggle the loading state',
        run: () => setLoading((current) => !current),
      },
      {
        id: 'table-long',
        group: 'Table',
        label: `Toggle ${LONG_ROWS} rows`,
        run: () => toggleLong(),
      },
      {
        id: 'table-columns',
        group: 'Table',
        label: 'Show every column',
        run: () => setHidden(new Set()),
      },
      {
        id: 'run-open',
        group: 'Runs',
        label: 'Open the newest run',
        run: () => setDetail(runs[0]),
      },
    ],
    [toggleLong],
  )

  return (
    <div className="min-h-dvh px-6 py-8">
      <div className="mx-auto flex max-w-295 flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-ui text-[34px] leading-none font-bold tracking-[-0.045em]">sley</p>
            <p className="mt-1.5 text-weft-dim">Components for interfaces that hold a lot of data.</p>
          </div>

          <div className="flex flex-wrap items-center gap-(--stack)">
            <ul className="tnum flex flex-wrap items-center gap-x-3 gap-y-1 font-data text-weft-faint">
              {knobs.map((knob) => (
                <li key={knob.name}>
                  {knob.name} <span className="text-weft-dim">{knob.value}</span>
                </li>
              ))}
            </ul>
            <Segmented legend="Density" options={DENSITIES} value={density} onSelect={setDensity} />
            <Segmented legend="Appearance" options={THEMES} value={theme} onSelect={setTheme} />
            <Button onClick={() => setPaletteOpen(true)}>
              <span>Commands</span>
              <kbd className="font-data text-[11px] text-weft-faint">⌘K</kbd>
            </Button>
          </div>
        </header>

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
          noun={['run', 'runs']}
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
      </div>

      <RunPanel run={detail} onClose={() => setDetail(null)} onCancelRun={setPending} />
      <CancelDialog run={pending} onClose={() => setPending(null)} onConfirm={cancelRun} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} commands={commands} />
      <Toaster toaster={toaster} />
    </div>
  )
}
