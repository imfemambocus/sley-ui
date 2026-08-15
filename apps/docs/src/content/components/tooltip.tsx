import { Button } from '@/components/ui/button/Button'
import { Tooltip } from '@/components/ui/tooltip/Tooltip'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const TooltipDemo = () => (
  <Demo caption="200ms to open and 80ms to close, which is faster than the Ark default.">
    <Tooltip content="The share of bases called with a quality of 30 or better.">
      <Button variant="quiet">Q30</Button>
    </Tooltip>
    <Tooltip content="Millions of reads that passed the chastity filter.">
      <Button variant="quiet">Reads</Button>
    </Tooltip>
  </Demo>
)

const Notes = () => (
  <>
    <P>
      An interface with two hundred elements on it has a lot of small questions, and the standard
      delay makes answering one feel like waiting. 200ms in and 80ms out is what a dense screen
      wants.
    </P>
    <P>
      The trigger is <Code>asChild</Code>, so the tip attaches to a control you already have. That
      matters in a table: the column head already holds a sort button, so a hint on a column needs no
      second target and no <Code>tabIndex</Code> on a bare span. A tip on a cell would repeat itself
      once for every row, which is why a column carries <Code>hint</Code> and a cell does not.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'tooltip',
  name: 'Tooltip',
  summary: 'A hint on a control you already have, faster than the default.',
  exports: ['Tooltip'],
  Demo: TooltipDemo,
  api: [
    { name: 'content', type: 'ReactNode', required: true, detail: 'What the tip says.' },
    {
      name: 'children',
      type: 'ReactElement',
      required: true,
      detail: 'One element. It becomes the trigger, so it must accept a ref and the data attributes.',
    },
    { name: 'openDelay', type: 'number', detail: 'Defaults to 200ms.' },
    { name: 'closeDelay', type: 'number', detail: 'Defaults to 80ms.' },
  ],
  Notes,
}
