import { useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/Dialog'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const DialogDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Demo caption="Watch it leave. The exit runs on --ease-exit and is shorter than the entry.">
      <Button variant="danger" onClick={() => setOpen(true)}>
        Cancel R-4819
      </Button>
      <Dialog open={open} role="alertdialog" onOpenChange={(details) => setOpen(details.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel R-4819?</DialogTitle>
            <DialogDescription>
              The instrument stops, and the reads it has written stay on the run.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-weft-dim">
              61.2M reads are on disk. They are kept whatever you choose here.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="quiet">Keep the run</Button>
            </DialogClose>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Cancel the run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      What a dialog holds is never the same twice, so this one is compound: eight parts, and you
      assemble them. A panel and a tooltip take props instead, because each of those has one shape.
    </P>
    <P>
      Every layer on the site leaves the way it came in, and leaves faster. The entry runs
      <Code> --dur-overlay</Code> on <Code>--ease-beat</Code>, and the exit runs{' '}
      <Code>--dur-local</Code> on <Code>--ease-exit</Code>. <Code>unmountOnExit</Code> and{' '}
      <Code>lazyMount</Code> are both on by default, so a copied dialog animates out with no wiring
      from you.
    </P>
    <P>
      If your dialog reads from a row, keep the last row in state until the layer has left. A caller
      that returns null the moment the selection clears takes the node away before the animation can
      play.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'dialog',
  name: 'Dialog',
  summary: 'A modal that dims the page, traps focus, and animates out before it unmounts.',
  exports: [
    'Dialog',
    'DialogTrigger',
    'DialogContent',
    'DialogHeader',
    'DialogTitle',
    'DialogDescription',
    'DialogBody',
    'DialogFooter',
    'DialogClose',
  ],
  Demo: DialogDemo,
  api: [
    { name: 'open', type: 'boolean', detail: 'Controlled. Leave it out and use DialogTrigger instead.' },
    { name: 'onOpenChange', type: '(details: { open: boolean }) => void', detail: "Ark's shape, passed through untouched." },
    { name: 'role', type: "'dialog' | 'alertdialog'", detail: 'An alertdialog is announced immediately and does not close on the backdrop.' },
    { name: 'unmountOnExit', type: 'boolean', detail: 'On by default, so the exit animation has a node to play on.' },
    { name: 'lazyMount', type: 'boolean', detail: 'On by default. The content is not in the document until it first opens.' },
  ],
  measured: [
    {
      value: '0.16s',
      what: 'The exit, on the exit curve',
      detail: 'The dialog, the panel and the palette all leave in the same time. The entry is 0.24s.',
    },
    {
      value: '0ms',
      what: 'Every duration under reduced motion',
      detail: 'Each layer still unmounts. Nothing is left in the document waiting for an animation that never runs.',
    },
  ],
  Notes,
}
