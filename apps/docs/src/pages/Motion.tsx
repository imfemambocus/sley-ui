import { useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/Dialog'
import { Panel } from '@/components/ui/panel/Panel'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs/Tabs'
import { CodeBlock } from '../site/CodeBlock'
import { Demo } from '../site/Demo'
import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

const DURATIONS = [
  { name: '--dur-instant', value: '90ms', what: 'A colour change under the pointer. A hover, a focus, a border.' },
  { name: '--dur-local', value: '160ms', what: 'Something moving inside its own box. A tab mark, a popover, every exit.' },
  { name: '--dur-overlay', value: '240ms', what: 'A layer arriving from outside the page. A dialog, a panel, a toast.' },
]

const EASES = [
  { name: '--ease-beat', value: 'cubic-bezier(0.2, 0.9, 0.24, 1)', what: 'The beat-up of the loom. It leaves fast and settles with no bounce.' },
  { name: '--ease-glide', value: 'cubic-bezier(0.33, 0, 0.15, 1)', what: 'A slow start for something that loops, like the skeleton.' },
  { name: '--ease-exit', value: 'cubic-bezier(0.5, 0, 0.9, 0.4)', what: 'Accelerating away. Only used on the way out.' },
]

interface TokenTableProps {
  readonly rows: readonly { name: string; value: string; what: string }[]
  readonly heading: string
}

const TokenTable = ({ rows, heading }: TokenTableProps) => (
  <div className="border border-reed bg-raised">
    <p className="reed-edge px-4 py-2 font-data text-[11px] tracking-[0.13em] text-weft-faint uppercase">
      {heading}
    </p>
    <dl className="flex flex-col">
      {rows.map((row) => (
        <div key={row.name} className="flex flex-col gap-1 border-t border-reed/60 px-4 py-3 first:border-t-0">
          <dt className="flex flex-wrap items-baseline gap-3">
            <span className="font-data text-weft">{row.name}</span>
            <span className="font-data text-[12px] text-indigo">{row.value}</span>
          </dt>
          <dd className="text-weft-dim">{row.what}</dd>
        </div>
      ))}
    </dl>
  </div>
)

const LayerDemo = () => {
  const [dialog, setDialog] = useState(false)
  const [panel, setPanel] = useState(false)

  return (
    <Demo caption="Open each one and watch it leave. The exit is shorter than the entry, every time.">
      <Button onClick={() => setDialog(true)}>Open a dialog</Button>
      <Button onClick={() => setPanel(true)}>Open a panel</Button>
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTab value="one">First</TabsTab>
          <TabsTab value="two">Second</TabsTab>
          <TabsTab value="three">Third</TabsTab>
        </TabsList>
        <TabsPanel value="one" className="text-weft-dim">
          The mark slides on --ease-beat.
        </TabsPanel>
        <TabsPanel value="two" className="text-weft-dim">
          It takes --dur-local to get here.
        </TabsPanel>
        <TabsPanel value="three" className="text-weft-dim">
          Zag reads both names out of the stylesheet.
        </TabsPanel>
      </Tabs>

      <Dialog open={dialog} onOpenChange={(details) => setDialog(details.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arriving on the beat</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-weft-dim">
              240ms in on --ease-beat, 160ms out on --ease-exit. Close it and watch the second half.
            </p>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Panel open={panel} onOpenChange={setPanel} title="Arriving from the edge">
        <p className="px-(--cell-x) text-weft-dim">
          The panel slides from the edge that holds it, and leaves the way it came.
        </p>
      </Panel>
    </Demo>
  )
}

export const MotionPage = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Motion</PageTitle>
      <Lede>
        Durations are named for what moves, not for how long they take. Three of them, three curves,
        and one place that turns the whole lot off.
      </Lede>
    </header>

    <TokenTable heading="Durations" rows={DURATIONS} />
    <TokenTable heading="Curves" rows={EASES} />

    <Section id="named" title="Named for what moves">
      <P>
        A scale called fast, normal and slow tells you nothing about when to reach for which one, so
        every developer picks by feel and the interface ends up with eleven different timings. Naming
        them for the thing that moves makes the choice obvious: a hover is instant, a thing inside its
        own box is local, a layer arriving over the page is overlay.
      </P>
      <P>
        The beat curve is the loom&apos;s beat-up, which is the stroke that drives a pick of weft home
        against the cloth. It leaves quickly and settles without overshooting. Nothing in this system
        bounces.
      </P>
    </Section>

    <LayerDemo />

    <Section id="exit" title="Every layer leaves the way it came, and leaves faster">
      <P>
        The entry runs <Code>--dur-overlay</Code> on <Code>--ease-beat</Code>. The exit runs{' '}
        <Code>--dur-local</Code> on <Code>--ease-exit</Code>. Arriving deserves attention and leaving
        does not, so the way out is shorter and accelerates away instead of settling.
      </P>
      <Note>
        A layer that animates out needs the caller to keep its data until it has gone. Return null the
        moment your selection clears and you take the node away before the animation can play.
      </Note>
    </Section>

    <Section id="reduced" title="Reduced motion is one block">
      <CodeBlock
        code={`@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-instant: 0ms;
    --dur-local: 0ms;
    --dur-overlay: 0ms;
  }
}`}
      />
      <P>
        Because no component holds a duration of its own, setting the three tokens to zero stops every
        transition in the system. The looping animations are switched off separately in the same
        place. Everything still mounts and unmounts correctly at zero, which I checked rather than
        assumed.
      </P>
    </Section>

    <Section id="measured" title="Measured">
      <Measured
        rows={[
          {
            value: '0.16s',
            what: 'The exit of the dialog, the panel and the palette',
            detail: 'All three on --ease-exit. The entry is 0.24s on --ease-beat.',
          },
          {
            value: '1020px to 1342px',
            what: 'How far the panel travels before Ark removes it',
            detail: 'Sampled during the exit, which proves the node outlives the state change.',
          },
          {
            value: '0.16s',
            what: 'The tab mark sliding between tabs',
            detail: 'Zag reads --dur-local and --ease-beat off the .tab-mark class.',
          },
          {
            value: '0ms',
            what: 'Every duration under reduced motion',
            detail: 'Each layer still unmounts. Nothing waits in the document for an animation that never runs.',
          },
        ]}
      />
    </Section>
  </article>
)
