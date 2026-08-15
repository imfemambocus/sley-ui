import { useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import {
  Field,
  FieldError,
  FieldHint,
  FieldInput,
  FieldLabel,
  FieldSet,
  FieldTextarea,
} from '@/components/ui/field/Field'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const FieldDemo = () => {
  const [owner, setOwner] = useState('M. Haas')
  const [note, setNote] = useState('')

  return (
    <Demo
      className="w-full max-w-md"
      caption="Empty the owner to see the error. In dense mode the hints go to screen readers only."
    >
      <FieldSet legend="Reassign the run" className="w-full">
        <Field required invalid={owner.trim() === ''}>
          <FieldLabel>New owner</FieldLabel>
          <FieldInput value={owner} onChange={(event) => setOwner(event.target.value)} />
          <FieldHint>The person who answers for the result.</FieldHint>
          <FieldError>Name the person who takes the run.</FieldError>
        </Field>

        <Field>
          <FieldLabel>Note</FieldLabel>
          <FieldTextarea value={note} onChange={(event) => setNote(event.target.value)} />
          <FieldHint>The note goes on the run, and the current owner reads it.</FieldHint>
        </Field>

        <div className="flex justify-end">
          <Button variant="primary" disabled={owner.trim() === ''}>
            Save
          </Button>
        </div>
      </FieldSet>
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      A hint goes to <Code>sr-only</Code> in dense mode. Nobody chooses the width of their screen, so
      width may not hide anything, but the application chooses the density, and a dense mode asking
      for less chrome is the application speaking for itself. The hint is still announced; it just
      stops taking a line.
    </P>
    <P>
      The error text is rendered by Ark only while the field is invalid, so both can sit in the
      markup at once and you do not branch in your own JSX. The control takes the madder border from{' '}
      <Code>data-invalid</Code>, which is the same attribute.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'field',
  name: 'Field',
  summary: 'A label, a control, a hint and an error, wired together by Ark.',
  exports: ['Field', 'FieldLabel', 'FieldInput', 'FieldTextarea', 'FieldHint', 'FieldError', 'FieldSet'],
  Demo: FieldDemo,
  api: [
    { name: 'required', type: 'boolean', detail: 'Draws the indicator beside the label and marks the control.' },
    { name: 'invalid', type: 'boolean', detail: 'Shows FieldError and dyes the control border madder.' },
    { name: 'disabled', type: 'boolean', detail: 'Dims the whole field and stops the control.' },
    { name: 'readOnly', type: 'boolean', detail: 'Keeps the control focusable and refuses edits.' },
    { name: 'legend (FieldSet)', type: 'string', required: true, detail: 'The heading, closed by the reed.' },
  ],
  Notes,
}
