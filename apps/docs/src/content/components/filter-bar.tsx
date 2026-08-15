import { useState } from 'react'
import { FilterBar, type FilterValues } from '@/components/ui/filter-bar/FilterBar'
import { RUN_GROUPS } from '@demo/filters'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const FilterBarDemo = () => {
  const [query, setQuery] = useState('')
  const [values, setValues] = useState<FilterValues>({ status: ['running', 'failed'] })

  return (
    <Demo caption="Two filters are already on. The chips below the row are how you take one off.">
      <FilterBar
        className="w-full"
        query={query}
        onQueryChange={setQuery}
        groups={RUN_GROUPS}
        values={values}
        onValuesChange={setValues}
        searchLabel="Search runs"
        placeholder="Search runs, samples, owners"
      />
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      The count beside a group label is a plain mono numeral in the indigo, with no fill behind it. A
      filled block reads as a badge and competes with the word next to it, which is the same reason
      the table shows status as a dot plus a word rather than a pill.
    </P>
    <P>
      The search field is a composite: an icon and an input inside one box. The ring goes on the
      wrapper through <Code>.focus-ring</Code>, which reads <Code>:has(:focus-visible)</Code>, and
      the input keeps <Code>outline-none</Code>. Not <Code>focus-within</Code>, which fires on a
      pointer click where the other controls do not.
    </P>
    <P>
      The bar owns no data. It takes the groups and a record of what is selected, and it tells you
      when that record changes. Matching rows against it is yours, because only you know what a
      value means.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'filter-bar',
  name: 'Filter bar',
  summary: 'A search field, a select for each group, and a chip for every value that is on.',
  exports: ['FilterBar', 'type FilterGroup', 'type FilterValues'],
  Demo: FilterBarDemo,
  api: [
    { name: 'query', type: 'string', required: true, detail: 'The text in the search field.' },
    { name: 'onQueryChange', type: '(next: string) => void', required: true, detail: 'Called on every keystroke.' },
    {
      name: 'groups',
      type: 'readonly FilterGroup[]',
      required: true,
      detail: 'Each group is a key, a label and the values it offers.',
    },
    {
      name: 'values',
      type: 'Record<string, readonly string[]>',
      required: true,
      detail: 'What is selected, keyed by group. An absent key means nothing is on.',
    },
    {
      name: 'onValuesChange',
      type: '(next: FilterValues) => void',
      required: true,
      detail: 'Called when a select changes, a chip is removed, or the clear link is used.',
    },
    { name: 'searchLabel', type: 'string', detail: 'The accessible name of the search field.' },
    { name: 'placeholder', type: 'string', detail: 'The placeholder inside it.' },
  ],
  Notes,
}
