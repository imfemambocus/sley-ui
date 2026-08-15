import { useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { CommandPalette, type Command } from '@/components/ui/command-palette/CommandPalette'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const COMMANDS: readonly Command[] = [
  { id: 'run-open', group: 'Runs', label: 'Open the newest run', hint: '⏎', run: () => {} },
  { id: 'run-cancel', group: 'Runs', label: 'Cancel the selected runs', run: () => {} },
  { id: 'run-export', group: 'Runs', label: 'Export the selection as CSV', run: () => {} },
  { id: 'filter-running', group: 'Filters', label: 'Show running runs only', run: () => {} },
  { id: 'filter-clear', group: 'Filters', label: 'Clear all filters', run: () => {} },
  { id: 'view-columns', group: 'View', label: 'Show every column', run: () => {} },
  { id: 'view-dense', group: 'View', label: 'Set density to dense', run: () => {} },
]

const PaletteDemo = () => {
  const [open, setOpen] = useState(false)

  return (
    <Demo caption="Arrow keys move the cursor, Enter commits, Escape leaves. In dense mode the group labels go.">
      <Button onClick={() => setOpen(true)}>Open the palette</Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={COMMANDS} />
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      The palette has no chosen state, so its cursor is the shed alone: the row under the pointer or
      the keyboard lifts, and nothing stays behind after Enter. That is the half of the selection
      pattern this component needs, and drawing the other half would say something untrue.
    </P>
    <P>
      The shell is Ark&apos;s dialog and the list is mine. Ark&apos;s combobox is the natural fit,
      but its positioner assumes a floating anchor and fights an inline list inside a dialog. The
      input takes focus through <Code>initialFocusEl</Code> rather than <Code>autoFocus</Code>,
      because the attribute needed a lint suppression naming a plugin that you may not have
      installed.
    </P>
    <P>
      In dense mode the group headings are not just smaller, they are gone, and the reader gets more
      rows in the same height. The density modes change what is present, not only what size it is.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'command-palette',
  name: 'Command palette',
  summary: 'Grouped commands, filtered as you type, with the cursor on the keyboard.',
  exports: ['CommandPalette', 'type Command'],
  Demo: PaletteDemo,
  api: [
    { name: 'open', type: 'boolean', required: true, detail: 'Controlled. Wire your own shortcut to it.' },
    { name: 'onOpenChange', type: '(open: boolean) => void', required: true, detail: 'Called by Escape, the backdrop and a chosen command.' },
    {
      name: 'commands',
      type: 'readonly Command[]',
      required: true,
      detail: 'Each one is an id, a group, a label, an optional hint and the function to run.',
    },
    { name: 'placeholder', type: 'string', detail: 'The text in the input. It defaults to "Run a command".' },
  ],
  Notes,
}
