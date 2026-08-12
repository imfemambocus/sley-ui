import { useEffect, useMemo, useState } from 'react'
import { CommandPalette, type Command } from './components/CommandPalette'
import { EMPTY_FILTERS, FilterBar, type Filters } from './components/FilterBar'
import { DataTable } from './components/DataTable'
import { ASSAYS, STATUSES, runs } from './data/runs'

const DENSITIES = ['comfortable', 'compact', 'dense'] as const
type Density = (typeof DENSITIES)[number]

const THEMES = ['dark', 'light'] as const
type Theme = (typeof THEMES)[number]

const OWNERS = [...new Set(runs.map((run) => run.owner))].sort((a, b) => a.localeCompare(b))

function matchesFilters(run: (typeof runs)[number], filters: Filters) {
  const needle = filters.query.trim().toLowerCase()
  if (needle !== '') {
    const haystack = `${run.id} ${run.sample} ${run.assay} ${run.owner}`.toLowerCase()
    if (!haystack.includes(needle)) return false
  }
  if (filters.assays.length > 0 && !filters.assays.includes(run.assay)) return false
  if (filters.statuses.length > 0 && !filters.statuses.includes(run.status)) return false
  if (filters.owners.length > 0 && !filters.owners.includes(run.owner)) return false
  return true
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
        className="h-[var(--ctl-h)] cursor-pointer px-[var(--cell-x)] text-weft-dim transition-colors duration-[var(--dur-instant)] ease-[var(--ease-beat)] hover:text-weft aria-pressed:bg-indigo-wash aria-pressed:text-weft"
      >
        {option}
      </button>
    ))}
  </fieldset>
)

export const App = () => {
  const [density, setDensity] = useState<Density>('compact')
  const [theme, setTheme] = useState<Theme>('dark')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [rowHeight, setRowHeight] = useState('')

  useEffect(() => {
    const root = document.documentElement
    root.dataset.density = density
    root.dataset.theme = theme
    setRowHeight(getComputedStyle(root).getPropertyValue('--row-h').trim())
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

  const visible = useMemo(() => runs.filter((run) => matchesFilters(run, filters)), [filters])

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
        run: () => setFilters({ ...EMPTY_FILTERS, statuses: ['running'] }),
      },
      {
        id: 'filter-failed',
        group: 'Filters',
        label: 'Show failed runs only',
        run: () => setFilters({ ...EMPTY_FILTERS, statuses: ['failed'] }),
      },
      {
        id: 'filter-clear',
        group: 'Filters',
        label: 'Clear all filters',
        run: () => setFilters(EMPTY_FILTERS),
      },
    ],
    [],
  )

  return (
    <div className="min-h-dvh px-6 py-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-ui text-[34px] leading-none font-bold tracking-[-0.045em]">sley</p>
            <p className="mt-1.5 text-weft-dim">Components for interfaces that hold a lot of data.</p>
          </div>

          <div className="flex flex-wrap items-center gap-[var(--stack)]">
            <p className="tnum font-data text-weft-faint">
              row {rowHeight}
            </p>
            <Segmented legend="Density" options={DENSITIES} value={density} onSelect={setDensity} />
            <Segmented legend="Appearance" options={THEMES} value={theme} onSelect={setTheme} />
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex h-[var(--ctl-h)] cursor-pointer items-center gap-2 border border-reed bg-ground px-[var(--cell-x)] text-weft-dim transition-colors duration-[var(--dur-instant)] ease-[var(--ease-beat)] hover:border-reed-lit hover:text-weft"
            >
              Commands
              <kbd className="font-data text-[11px] text-weft-faint">⌘K</kbd>
            </button>
          </div>
        </header>

        <FilterBar
          filters={filters}
          onChange={setFilters}
          assays={ASSAYS}
          statuses={STATUSES}
          owners={OWNERS}
        />

        <DataTable rows={visible} />

        <footer className="text-weft-faint">
          Density is one token group, not fifty. Every control on this page reads the same four values.
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} commands={commands} />
    </div>
  )
}
