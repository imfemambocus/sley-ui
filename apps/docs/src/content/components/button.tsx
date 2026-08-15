import { Button } from '@/components/ui/button/Button'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const ButtonDemo = () => (
  <Demo caption="Four variants, one height token. Move the density and every one follows.">
    <Button>Export</Button>
    <Button variant="primary">Save</Button>
    <Button variant="danger">Cancel the run</Button>
    <Button variant="quiet">Dismiss</Button>
    <Button disabled>Unavailable</Button>
  </Demo>
)

const Notes = () => (
  <>
    <P>
      I did not count this as one of the twelve. A dialog, a panel, a toast and an empty state all
      take an action, and without a button item every one of them would draw the control surface
      again. It sits with <Code>checkbox</Code> and <Code>icons</Code> as something the others are
      built out of.
    </P>
    <P>
      The default variant is the shared <Code>.ctl</Code> surface, which the select trigger and the
      search field also draw. Primary and danger fill with the indigo and the madder, and their text
      is the ground colour rather than white. Quiet drops the border and keeps the height, so a row
      of mixed buttons still lines up.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'button',
  name: 'Button',
  summary: 'The control surface every other component borrows.',
  exports: ['Button', 'type ButtonVariant'],
  Demo: ButtonDemo,
  api: [
    {
      name: 'variant',
      type: "'default' | 'primary' | 'danger' | 'quiet'",
      detail: 'The default reads the shared control surface. Quiet drops the border and keeps the height.',
    },
    {
      name: '...props',
      type: "ComponentPropsWithoutRef<'button'>",
      detail: 'Everything a button takes. The type defaults to button, so a form is not submitted by accident.',
    },
    {
      name: 'className',
      type: 'string',
      detail: 'Merged last through cx, so a utility of yours wins over the one in the component.',
    },
  ],
  Notes,
}
