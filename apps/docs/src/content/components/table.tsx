import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Table } from '@/components/ui/table/Table'
import { runColumns } from '@demo/columns'
import { runs } from '@demo/runs'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const TableDemo = () => {
  const [loading, setLoading] = useState(false)
  const columns = useMemo(() => runColumns(() => {}), [])

  return (
    <Demo
      bleed
      caption="Drag a divider to resize. Click a head to sort, three times to get the original order back."
    >
      <Table
        rows={runs.slice(0, 9)}
        columns={columns}
        rowId={(run) => run.id}
        title="Sequencing runs"
        noun="runs"
        loading={loading}
        actions={
          <Button onClick={() => setLoading((current) => !current)}>
            {loading ? 'Show the rows' : 'Show the loading state'}
          </Button>
        }
      />
    </Demo>
  )
}

const Notes = () => (
  <>
    <P>
      A column declares how many characters it holds, not how many pixels. The width is that count
      times the advance of the data face plus the padding, so the same definition gets wider when the
      reader moves to comfortable and tighter in dense. A px width ignored both, and a run id used to
      truncate in a column that had room for it.
    </P>
    <P>
      Two columns are pinned: the selection gutter and the first data column, because that one names
      the row. A table that scrolls sideways otherwise carries the identity of the row off the screen
      with everything else. Pinning forces the border model, since a pinned cell needs an opaque
      background and an opaque background hides a collapsed border, so every body cell carries its
      own top border instead.
    </P>
    <P>
      A narrow screen hides nothing. I built a column drop with width tiers, measured it at 390px,
      and found that five of ten columns had gone and the table still scrolled 82px. It bought no fit
      and cost the reader half the data, so I took it out. Which columns matter is the caller's
      judgement, not the component's.
    </P>
    <P>
      The loading state is the loom threaded and standing still: the warp in the reed with no weft
      through it. Each row adds one <Code>--dur-instant</Code> of delay, so the beat travels down the
      list. The empty state uses the same field and does not move.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'table',
  name: 'Table',
  summary: 'Sorting, resizing, selection, pinning, and a loading state made of unwoven warp.',
  exports: ['Table', 'type Column'],
  Demo: TableDemo,
  api: [
    {
      name: 'rows',
      type: 'readonly T[]',
      required: true,
      detail: 'Your data, in the order you want the third sort click to restore.',
    },
    {
      name: 'columns',
      type: 'readonly Column<T>[]',
      required: true,
      detail: 'Each one declares a key, a label, a character count and a render function.',
    },
    { name: 'rowId', type: '(row: T) => string', required: true, detail: 'A stable id. Selection is keyed off it.' },
    { name: 'title', type: 'string', required: true, detail: 'The heading in the table header.' },
    { name: 'noun', type: 'string', detail: 'What the count calls a row. It defaults to "rows".' },
    { name: 'loading', type: 'boolean', detail: 'Swaps the rows for the unwoven warp and hides the count.' },
    { name: 'emptyMessage', type: 'string', detail: 'The title of the empty state when no row survives the filters.' },
    { name: 'actions', type: 'ReactNode', detail: 'Controls in the table header, beside the count.' },
    {
      name: 'onSelectionChange',
      type: '(selected: ReadonlySet<string>) => void',
      detail: 'Reports only the selected rows that are currently on screen.',
    },
  ],
  measured: [
    {
      value: '609px',
      what: 'How far the demo above scrolls at 390px wide, in compact',
      detail: 'Ten columns, all of them present, inside their own frame. The page itself does not scroll at all.',
    },
    {
      value: '82px',
      what: 'What the old column drop still had to scroll',
      detail: 'Five of ten columns were hidden at that width and it did not buy a fit, so the tiers came out.',
    },
    {
      value: '18px / 51px',
      what: 'The pinned gutter and the run id, at a scroll of 400px',
      detail: 'Both hold their place while the rest travels under them, and the selected wash reaches both.',
    },
    {
      value: '8px',
      what: 'One arrow key press on a resize grip',
      detail: 'Exact, and it still works at that width. The grip is a real button, so the keyboard reaches it.',
    },
    {
      value: '6px',
      what: 'What the 13px checkbox flexed down to in a fixed 34px gutter',
      detail: 'Comfortable spends 28px of that column on padding. The gutter is now padding plus control, never a fixed width.',
    },
    {
      value: '7 of 7',
      what: 'Select all under a filter that leaves 7 rows',
      detail: 'Clearing the filter reports 8 of 27: the rows off screen keep their state but cannot be acted on.',
    },
  ],
  Notes,
}
