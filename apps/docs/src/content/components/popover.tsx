import { useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Checkbox } from '@/components/ui/checkbox/Checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover/Popover'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const COLUMNS = ['Run', 'Sample', 'Assay', 'Status', 'Reads', 'Q30']

const PopoverDemo = () => {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set(['Q30']))

  const toggle = (key: string) => {
    setHidden((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      return next
    })
  }

  return (
    <Demo caption="The column menu from the demo application, which is what this component was built for.">
      <Popover positioning={{ placement: 'bottom-start' }}>
        <PopoverTrigger asChild>
          <Button>
            <span className="inline-flex items-baseline gap-1.5">
              <span>Columns</span>
              {hidden.size > 0 && <span className="tnum font-data text-indigo">{hidden.size}</span>}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <ul>
            {COLUMNS.map((column) => (
              <li key={column}>
                <Checkbox
                  checked={!hidden.has(column)}
                  onCheckedChange={() => toggle(column)}
                  className="w-full px-(--cell-x) py-1 text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed hover:text-weft"
                >
                  {column}
                </Checkbox>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      A sticky table head makes a stacking context and paints over any portalled layer that has no
      rank of its own, which is how a popover ends up behind a table. Every layer that leaves the
      flow declares a rank here: <Code>--z-sticky</Code>, <Code>--z-panel</Code>,{' '}
      <Code>--z-popover</Code>, <Code>--z-backdrop</Code>, <Code>--z-modal</Code>.
    </P>
    <P>
      Ark positions its floating parts with an inline <Code>z-index: var(--z-index)</Code> beside an
      inline <Code>--z-index: auto</Code>. That declaration is the right seam to use, but an inline
      custom property outranks a stylesheet, so the rule that feeds it has to be marked important to
      reach it. That is one rule, in the token file, and no component thinks about it again.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'popover',
  name: 'Popover',
  summary: 'A small anchored surface that ranks itself above a sticky table head.',
  exports: ['Popover', 'PopoverTrigger', 'PopoverContent', 'PopoverTitle', 'PopoverDescription'],
  Demo: PopoverDemo,
  api: [
    { name: 'positioning', type: 'PositioningOptions', detail: 'Placement, offset, flip and shift, straight from Ark.' },
    { name: 'open', type: 'boolean', detail: 'Optional. Leave it out and the trigger drives it.' },
    { name: 'onOpenChange', type: '(details: { open: boolean }) => void', detail: "Ark's shape, passed through." },
    { name: 'asChild (trigger)', type: 'boolean', detail: 'Makes your own control the trigger rather than nesting a button in one.' },
  ],
  Notes,
}
