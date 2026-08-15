import { Button } from '@/components/ui/button/Button'
import { EmptyState } from '@/components/ui/empty-state/EmptyState'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const EmptyStateDemo = () => (
  <Demo bleed caption="The loom threaded and standing still. The loading state is the same field, moving.">
    <EmptyState
      title="No metrics yet"
      description="The run has produced no reads."
      action={<Button variant="quiet">Tell me when it starts</Button>}
    />
  </Demo>
)

const Notes = () => (
  <>
    <P>
      Every other library ships a grey box with an illustration in it. An unwoven warp is the exact
      picture of nothing here: the threads are standing in the reed and no weft has come through
      yet. It is the same motif as the table head rule and the column dividers, at the same pitch, so
      it adds no second idea to the system.
    </P>
    <P>
      <Code>.reed-warp</Code> holds the field and <Code>.reed-warp-beat</Code> adds the animation.
      The empty state takes the first and the loading skeleton takes both, which is the whole
      difference between them: waiting moves, and empty does not.
    </P>
    <P>The block is four row heights tall, so it does not collapse when the density tightens.</P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'empty-state',
  name: 'Empty state',
  summary: 'An unwoven warp, standing still.',
  exports: ['EmptyState'],
  Demo: EmptyStateDemo,
  api: [
    { name: 'title', type: 'string', required: true, detail: 'One line saying what is not there.' },
    { name: 'description', type: 'string', detail: 'A second line saying why.' },
    { name: 'action', type: 'ReactNode', detail: 'One control, if there is something the reader can do about it.' },
  ],
  Notes,
}
