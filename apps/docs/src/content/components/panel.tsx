import { useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Panel } from '@/components/ui/panel/Panel'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs/Tabs'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const PanelDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Demo caption="The page stays live behind it. Narrow the window under 640px and it becomes modal instead.">
      <Button onClick={() => setOpen(true)}>Open R-4819</Button>
      <Panel
        open={open}
        onOpenChange={setOpen}
        title="R-4819"
        description="RNA-seq on LCS-0911-C"
        footer={
          <Button variant="quiet" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <Tabs defaultValue="overview" className="flex flex-col">
          <TabsList className="px-(--cell-x)">
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab value="metrics">Metrics</TabsTab>
          </TabsList>
          <TabsPanel value="overview" className="px-(--cell-x) text-weft-dim">
            The instrument is still writing. Everything on this panel updates while it does, and the
            table behind you stays usable.
          </TabsPanel>
          <TabsPanel value="metrics" className="px-(--cell-x) text-weft-dim">
            61.2M reads, 91.4% Q30. Coverage is not meaningful for this assay.
          </TabsPanel>
        </Tabs>
      </Panel>
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      The panel is not modal, and that is the whole point of it. It reads one row while the table
      behind it stays live, so it traps no focus, locks no scroll and draws no backdrop.{' '}
      <Code>closeOnInteractOutside</Code> is false, because a click outside is how you open the next
      row rather than how you close this one.
    </P>
    <P>
      Under 640px it covers the page, and a thing that covers the page has to behave like a modal or
      it is a trap. At that width it takes Ark&apos;s modal mode, which traps focus, locks the body
      and hides the content underneath from assistive technology. Above it, all three go back off.
    </P>
    <P>
      The border sits on the content, not on the positioner. I had it the other way first, and the
      edge arrived at full strength before the content finished travelling. A border utility with no
      colour class is <Code>currentColor</Code> in Tailwind v4, which is the weft here, so the line
      was the wrong colour as well as early.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'panel',
  name: 'Panel',
  summary: 'A side panel that reads a row without taking the page away from you.',
  exports: ['Panel', 'type PanelSide'],
  Demo: PanelDemo,
  api: [
    { name: 'open', type: 'boolean', required: true, detail: 'Controlled.' },
    { name: 'onOpenChange', type: '(open: boolean) => void', required: true, detail: 'Called with the next state.' },
    { name: 'title', type: 'string', required: true, detail: 'Truncated in the header, and it names the dialog.' },
    { name: 'description', type: 'string', detail: 'A second line under the title, also truncated.' },
    { name: 'footer', type: 'ReactNode', detail: 'Actions along the bottom edge. The footer is not drawn without it.' },
    { name: 'side', type: "'start' | 'end'", detail: 'Which edge it comes from. It defaults to end.' },
    { name: 'children', type: 'ReactNode', required: true, detail: 'The body, in a scroll area that draws the extent marker.' },
  ],
  measured: [
    {
      value: '1020px to 1342px',
      what: 'How far the panel travels before Ark removes it',
      detail: 'Sampled during the exit. The node is still in the document for the whole slide.',
    },
    {
      value: '640px',
      what: 'Where it turns into a sheet',
      detail: 'At 390px: aria-modal is true, the body takes overflow hidden, and the root takes aria-hidden.',
    },
    {
      value: '0.16s',
      what: 'The exit, on --ease-exit',
      detail: 'The entry is 0.24s on --ease-beat. Leaving is always the faster half.',
    },
  ],
  Notes,
}
