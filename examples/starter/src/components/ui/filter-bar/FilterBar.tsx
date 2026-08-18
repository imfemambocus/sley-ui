import { useMemo } from 'react'
import { CloseIcon, SearchIcon } from '@/components/ui/icons/Icons'
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  createListCollection,
} from '@/components/ui/select/Select'
import { cx } from '@/lib/cx'

export interface FilterGroup {
  readonly key: string
  readonly label: string
  readonly options: readonly string[]
}

export type FilterValues = Readonly<Record<string, readonly string[]>>

interface FilterSelectProps {
  readonly group: FilterGroup
  readonly selected: readonly string[]
  readonly onSelect: (next: readonly string[]) => void
}

const FilterSelect = ({ group, selected, onSelect }: FilterSelectProps) => {
  const collection = useMemo(
    () => createListCollection({ items: group.options.map((value) => ({ label: value, value })) }),
    [group.options],
  )

  return (
    <Select
      collection={collection}
      multiple
      value={[...selected]}
      onValueChange={(details) => onSelect(details.value)}
    >
      <SelectTrigger>
        <span className="inline-flex items-baseline gap-1.5">
          <span className={selected.length > 0 ? 'text-weft' : 'text-weft-dim'}>{group.label}</span>
          {selected.length > 0 && <span className="tnum font-data text-indigo">{selected.length}</span>}
        </span>
      </SelectTrigger>
      <SelectContent>
        {collection.items.map((item) => (
          <SelectOption key={item.value} item={item} />
        ))}
      </SelectContent>
    </Select>
  )
}

interface Chip {
  readonly group: FilterGroup
  readonly value: string
}

interface FilterBarProps {
  readonly query: string
  readonly onQueryChange: (next: string) => void
  readonly groups: readonly FilterGroup[]
  readonly values: FilterValues
  readonly onValuesChange: (next: FilterValues) => void
  readonly searchLabel?: string
  readonly placeholder?: string
  readonly className?: string
}

export const FilterBar = ({
  query,
  onQueryChange,
  groups,
  values,
  onValuesChange,
  searchLabel = 'Search',
  placeholder = 'Search',
  className,
}: FilterBarProps) => {
  const chips: readonly Chip[] = groups.flatMap((group) =>
    (values[group.key] ?? []).map((value) => ({ group, value })),
  )

  const setGroup = (key: string, next: readonly string[]) => onValuesChange({ ...values, [key]: next })

  const removeChip = (chip: Chip) => {
    setGroup(
      chip.group.key,
      (values[chip.group.key] ?? []).filter((value) => value !== chip.value),
    )
  }

  return (
    <search className={cx('flex flex-col gap-(--stack)', className)}>
      <div className="flex flex-wrap items-center gap-(--stack)">
        <div className="ctl focus-ring h-(--ctl-h) min-w-55 flex-1">
          <SearchIcon className="size-3.5 text-weft-faint" />
          <input
            type="search"
            name="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            aria-label={searchLabel}
            className="w-full bg-transparent py-0 placeholder:text-weft-faint focus:outline-none"
          />
        </div>

        {groups.map((group) => (
          <FilterSelect
            key={group.key}
            group={group}
            selected={values[group.key] ?? []}
            onSelect={(next) => setGroup(group.key, next)}
          />
        ))}
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-(--stack)">
          {chips.map((chip) => (
            <li key={`${chip.group.key}:${chip.value}`}>
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="inline-flex h-(--ctl-h) cursor-pointer items-center gap-1.5 border border-indigo/40 bg-indigo-wash px-(--cell-x) text-weft transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:border-indigo"
              >
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="font-data text-weft-dim">{chip.group.label.toLowerCase()}</span>
                  {chip.value}
                </span>
                <CloseIcon className="size-3 text-weft-faint" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => onValuesChange({})}
              className="h-(--ctl-h) cursor-pointer px-(--cell-x) text-weft-dim underline-offset-4 hover:text-weft hover:underline"
            >
              Clear filters
            </button>
          </li>
        </ul>
      )}
    </search>
  )
}
