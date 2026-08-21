import { ASSAYS, STATUSES, runs, type Run } from './runs'

/*
 * the shapes the filter bar takes, declared here so this fixture belongs to no one
 * framework's copy of the component.
 */
export interface FilterGroup {
  readonly key: string
  readonly label: string
  readonly options: readonly string[]
}

export type FilterValues = Readonly<Record<string, readonly string[]>>

const OWNERS = [...new Set(runs.map((run) => run.owner))].sort((a, b) => a.localeCompare(b))

const FIELD: Record<string, (run: Run) => string> = {
  assay: (run) => run.assay,
  status: (run) => run.status,
  owner: (run) => run.owner,
}

export const RUN_GROUPS: readonly FilterGroup[] = [
  { key: 'assay', label: 'Assay', options: ASSAYS },
  { key: 'status', label: 'Status', options: STATUSES },
  { key: 'owner', label: 'Owner', options: OWNERS },
]

export function matchesFilters(run: Run, query: string, values: FilterValues) {
  const needle = query.trim().toLowerCase()
  if (needle !== '') {
    const haystack = `${run.id} ${run.sample} ${run.assay} ${run.owner}`.toLowerCase()
    if (!haystack.includes(needle)) return false
  }
  return RUN_GROUPS.every((group) => {
    const selected = values[group.key] ?? []
    return selected.length === 0 || selected.includes(FIELD[group.key](run))
  })
}
