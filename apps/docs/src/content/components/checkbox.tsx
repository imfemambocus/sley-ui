import { useState } from 'react'
import { Checkbox, type CheckedState } from '@/components/ui/checkbox/Checkbox'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const CheckboxDemo = () => {
  const [one, setOne] = useState<CheckedState>(true)
  const [two, setTwo] = useState<CheckedState>(false)

  return (
    <Demo caption="The third box is fixed at indeterminate, which is the head state of a partly selected table.">
      <Checkbox checked={one} onCheckedChange={setOne}>
        Keep the reads
      </Checkbox>
      <Checkbox checked={two} onCheckedChange={setTwo}>
        Notify the owner
      </Checkbox>
      <Checkbox checked="indeterminate" onCheckedChange={() => {}} label="Some rows selected" />
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      A box with text names itself from that text. The Ark root is a <Code>label</Code> element, so
      the words toggle the box too, and the hidden input is positioned absolutely, which means the
      gap costs a bare box nothing. Pass <Code>label</Code> only when there is no visible text, as a
      table row gutter does.
    </P>
    <P>
      Getting this to sit on the line took two attempts. A root that takes the text baseline put the
      box 2.25px above the centre of a table row. The fix was not on the control: the cell centres
      it, so the row decides rather than the font metrics, and what is left is a quarter of a pixel
      at worst.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'checkbox',
  name: 'Checkbox',
  summary: 'A 13px box that holds its own in a 25px row.',
  exports: ['Checkbox', 'type CheckedState'],
  Demo: CheckboxDemo,
  api: [
    {
      name: 'checked',
      type: "boolean | 'indeterminate'",
      required: true,
      detail: 'Controlled. The indeterminate state draws a bar rather than a tick.',
    },
    {
      name: 'onCheckedChange',
      type: '(checked: CheckedState) => void',
      required: true,
      detail: 'Called with the next state, not with an event.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      detail: 'The visible label. It renders inside the root, so clicking it toggles the box.',
    },
    {
      name: 'label',
      type: 'string',
      detail: 'Names a box that shows no text. It is ignored when there are children.',
    },
  ],
  measured: [
    {
      value: '2.25px',
      what: 'How far the box sat above the row centre when it took the text baseline',
      detail: 'Visible at a glance once a column of them ran down the page.',
    },
    {
      value: '0.05px to 0.25px',
      what: 'What is left once the cell centres it',
      detail: 'Comfortable, compact and dense, measured against the row box. The residue grows as the row tightens.',
    },
    {
      value: '13px',
      what: 'The box, in every density',
      detail: 'It is --ctl-box, and it never shrinks. A narrow cell overflows before the control does.',
    },
  ],
  Notes,
}
