import { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  createListCollection,
} from '@/components/ui/select/Select'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const ASSAYS = ['WGS', 'RNA-seq', 'ATAC-seq', 'Exome', 'Methyl', 'scRNA']

const SelectDemo = () => {
  const [one, setOne] = useState<string[]>(['Exome'])
  const [many, setMany] = useState<string[]>(['WGS', 'Methyl'])
  const collection = useMemo(
    () => createListCollection({ items: ASSAYS.map((value) => ({ label: value, value })) }),
    [],
  )

  return (
    <Demo caption="Move the keyboard through the list. The shed follows you; the selvedge stays on what you chose.">
      <Select collection={collection} value={one} onValueChange={(details) => setOne(details.value)}>
        <SelectTrigger>
          <span className={one.length > 0 ? 'text-weft' : 'text-weft-dim'}>{one[0] ?? 'Assay'}</span>
        </SelectTrigger>
        <SelectContent>
          {collection.items.map((item) => (
            <SelectOption key={item.value} item={item} />
          ))}
        </SelectContent>
      </Select>

      <Select
        collection={collection}
        multiple
        value={many}
        onValueChange={(details) => setMany(details.value)}
      >
        <SelectTrigger>
          <span className="inline-flex items-baseline gap-1.5">
            <span className={many.length > 0 ? 'text-weft' : 'text-weft-dim'}>Assay</span>
            {many.length > 0 && <span className="tnum font-data text-indigo">{many.length}</span>}
          </span>
        </SelectTrigger>
        <SelectContent>
          {collection.items.map((item) => (
            <SelectOption key={item.value} item={item} />
          ))}
        </SelectContent>
      </Select>
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      This is the component the selection pattern was designed against, because it is the one that
      shows both states at once. The shed is where you are: the highlighted option lifts its surface
      and its text steps up. The selvedge is what you chose: the indigo wash and a 2px reed on the
      leading edge, at the current pitch.
    </P>
    <P>
      A selvedge is the finished edge of a woven cloth. The mark is a utility rather than a class on
      an element, because Ark owns the state. <Code>.selvedge</Code> reads a custom property that is
      transparent, and <Code>data-[state=checked]:selvedge-on</Code> dyes it.
    </P>
    <P>
      The content keeps <Code>outline-none</Code> with no focus ring, deliberately. The highlighted
      item already shows where you are in the list, and a ring around the whole surface would say the
      same thing less precisely.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'select',
  name: 'Select',
  summary: 'Single or multiple, with the shed on the cursor and the selvedge on the choice.',
  exports: ['Select', 'SelectTrigger', 'SelectContent', 'SelectOption', 'createListCollection', 'type SelectOptionItem'],
  vueImports: [
    "import Select from '@/components/ui/select/Select.vue'",
    "import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'",
    "import SelectContent from '@/components/ui/select/SelectContent.vue'",
    "import SelectOption, { type SelectOptionItem } from '@/components/ui/select/SelectOption.vue'",
    "import { createListCollection } from '@ark-ui/vue/select'",
  ],
  Demo: SelectDemo,
  api: [
    {
      name: 'collection',
      type: 'ListCollection',
      required: true,
      detail: 'Built with createListCollection, which is re-exported so you need no Ark import.',
    },
    { name: 'multiple', type: 'boolean', detail: 'Lets more than one option carry the selvedge.' },
    { name: 'value', type: 'string[]', detail: 'An array in both modes. A single select holds one entry.' },
    { name: 'onValueChange', type: '(details: { value: string[] }) => void', detail: "Ark's shape, passed through." },
    { name: 'positioning', type: 'PositioningOptions', detail: 'Placement, offset and flip behaviour, straight from Ark.' },
  ],
  Notes,
}
