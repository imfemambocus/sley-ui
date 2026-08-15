import type { ReactNode } from 'react'
import { Elapsed, Figure } from '@/components/ui/figure/Figure'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

interface RowProps {
  readonly label: string
  readonly children: ReactNode
}

const Row = ({ label, children }: RowProps) => (
  <div className="flex items-baseline justify-between gap-8 border-b border-reed/60 py-1.5">
    <span className="text-weft-dim">{label}</span>
    <span className="tnum font-data text-weft">{children}</span>
  </div>
)

const FigureDemo = () => (
  <Demo
    className="w-full max-w-sm"
    caption="A missing value is one tick of the reed, not a hyphen. A low value carries the reed under its own digits."
  >
    <div className="flex w-full flex-col">
      <Row label="Reads (M)">
        <Figure value={412.8} />
      </Row>
      <Row label="Q30 (%)">
        <Figure value={94.2} />
      </Row>
      <Row label="Q30 (%), under 80">
        <Figure value={62.7} low />
      </Row>
      <Row label="Coverage (x), none yet">
        <Figure value={0} />
      </Row>
      <Row label="Elapsed">
        <Elapsed minutes={401} />
      </Row>
    </div>
  </Demo>
)

const Notes = () => (
  <>
    <P>
      The numbers are the content of a data tool, and no library I reached for treated them as a
      design surface. So the digits after the decimal point are dimmed and the integer part reads
      first, the unit lives in the column head rather than in every cell, and a value that crosses a
      threshold gets the reed underneath its own digits in the madder.
    </P>
    <P>
      Underneath, not on the divider. I dyed the divider first, and the first person who read it
      attributed the mark to the column on the left. A divider is shared with the next column, so it
      cannot name which of the two values it is talking about. A state belongs to the thing it
      describes.
    </P>
    <P>
      A background layer shifts no digits, so the column keeps its decimal alignment. The value also
      carries an <Code>sr-only</Code> note, because a colour and a texture reach no screen reader.
    </P>
    <P>
      <Code>Elapsed</Code> is the one place a unit sits in the cell. A duration carries two of them,
      and a head cannot hold both.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'figure',
  name: 'Figure',
  summary: 'The numeric layer: dimmed decimals, a reed tick for nothing, a reed mark for too low.',
  exports: ['Figure', 'Elapsed'],
  Demo: FigureDemo,
  api: [
    { name: 'value', type: 'number', required: true, detail: 'Zero renders one tick of the reed at the current pitch.' },
    { name: 'digits', type: 'number', detail: 'How many decimal places to show. It defaults to 1.' },
    { name: 'low', type: 'boolean', detail: 'Draws the madder reed under the digits and adds a screen reader note.' },
    { name: 'minutes (Elapsed)', type: 'number', required: true, detail: 'Rendered as hours and minutes, with the units dimmed.' },
  ],
  Notes,
}
