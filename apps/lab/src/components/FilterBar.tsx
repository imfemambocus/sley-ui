import { Portal } from '@ark-ui/react/portal'
import { Select, createListCollection } from '@ark-ui/react/select'
import { useMemo } from 'react'
import { CheckIcon, ChevronIcon, CloseIcon, SearchIcon } from './icons'

export interface Filters {
  readonly query: string
  readonly assays: readonly string[]
  readonly statuses: readonly string[]
  readonly owners: readonly string[]
}

export const EMPTY_FILTERS: Filters = { query: '', assays: [], statuses: [], owners: [] }

const CONTROL =
  'inline-flex items-center gap-1.5 border border-reed bg-ground px-[var(--cell-x)] text-weft transition-colors duration-[var(--dur-instant)] ease-[var(--ease-beat)] hover:border-reed-lit'

interface FilterSelectProps {
  readonly label: string
  readonly options: readonly string[]
  readonly selected: readonly string[]
  readonly onSelect: (next: string[]) => void
}

const FilterSelect = ({ label, options, selected, onSelect }: FilterSelectProps) => {
  const collection = useMemo(
    () => createListCollection({ items: options.map((value) => ({ label: value, value })) }),
    [options],
  )

  return (
    <Select.Root
      collection={collection}
      multiple
      value={[...selected]}
      onValueChange={(details) => onSelect(details.value)}
    >
      <Select.Control>
        <Select.Trigger className={`${CONTROL} h-[var(--ctl-h)] cursor-pointer`}>
          <span className={selected.length > 0 ? 'text-weft' : 'text-weft-dim'}>{label}</span>
          {selected.length > 0 && (
            <span className="tnum bg-indigo px-1 font-data text-[11px] text-ground">{selected.length}</span>
          )}
          <ChevronIcon className="size-3 text-weft-faint" />
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content className="min-w-[168px] border border-reed-lit bg-raised py-1 shadow-lg shadow-black/30 focus:outline-none">
            {collection.items.map((item) => (
              <Select.Item
                key={item.value}
                item={item}
                className="flex cursor-pointer items-center justify-between gap-3 px-[var(--cell-x)] py-1 text-weft-dim data-[highlighted]:bg-indigo-wash data-[highlighted]:text-weft"
              >
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon className="size-3 text-indigo" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}

interface Chip {
  readonly group: keyof Omit<Filters, 'query'>
  readonly value: string
}

interface FilterBarProps {
  readonly filters: Filters
  readonly onChange: (next: Filters) => void
  readonly assays: readonly string[]
  readonly statuses: readonly string[]
  readonly owners: readonly string[]
}

export const FilterBar = ({ filters, onChange, assays, statuses, owners }: FilterBarProps) => {
  const chips: readonly Chip[] = [
    ...filters.assays.map((value) => ({ group: 'assays' as const, value })),
    ...filters.statuses.map((value) => ({ group: 'statuses' as const, value })),
    ...filters.owners.map((value) => ({ group: 'owners' as const, value })),
  ]

  const removeChip = (chip: Chip) => {
    onChange({ ...filters, [chip.group]: filters[chip.group].filter((value) => value !== chip.value) })
  }

  return (
    <search className="flex flex-col gap-[var(--stack)]">
      <div className="flex flex-wrap items-center gap-[var(--stack)]">
        <div className={`${CONTROL} h-[var(--ctl-h)] min-w-[220px] flex-1 focus-within:border-indigo`}>
          <SearchIcon className="size-3.5 text-weft-faint" />
          <input
            type="search"
            name="run-search"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Search runs, samples, owners"
            aria-label="Search runs"
            className="w-full bg-transparent py-0 placeholder:text-weft-faint focus:outline-none"
          />
        </div>

        <FilterSelect
          label="Assay"
          options={assays}
          selected={filters.assays}
          onSelect={(next) => onChange({ ...filters, assays: next })}
        />
        <FilterSelect
          label="Status"
          options={statuses}
          selected={filters.statuses}
          onSelect={(next) => onChange({ ...filters, statuses: next })}
        />
        <FilterSelect
          label="Owner"
          options={owners}
          selected={filters.owners}
          onSelect={(next) => onChange({ ...filters, owners: next })}
        />
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-[var(--stack)]">
          {chips.map((chip) => (
            <li key={`${chip.group}:${chip.value}`}>
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="inline-flex h-[var(--ctl-h)] cursor-pointer items-center gap-1.5 border border-indigo/40 bg-indigo-wash px-[var(--cell-x)] text-weft transition-colors duration-[var(--dur-instant)] ease-[var(--ease-beat)] hover:border-indigo"
              >
                <span className="font-data text-weft-dim">{chip.group.slice(0, -1)}</span>
                {chip.value}
                <CloseIcon className="size-3 text-weft-faint" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}
              className="h-[var(--ctl-h)] cursor-pointer px-[var(--cell-x)] text-weft-dim underline-offset-4 hover:text-weft hover:underline"
            >
              Clear filters
            </button>
          </li>
        </ul>
      )}
    </search>
  )
}
