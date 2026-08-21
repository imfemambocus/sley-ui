import { startTransition, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Table } from '@/components/ui/table/Table'
import { runColumns } from '@demo/columns'
import { longRuns, runs, type Run } from '@demo/runs'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const SHORT = runs.slice(0, 9)
const LONG_ROWS = 5000
const LOAD_MS = 450

const TableDemo = () => {
  const [loading, setLoading] = useState(false)
  const [long, setLong] = useState(false)
  const [rows, setRows] = useState<readonly Run[]>(SHORT)
  const columns = useMemo(() => runColumns(() => {}), [])

  /* the batch is built in memory, and the pause stands in for the fetch a real application makes */
  const toggleLong = () => {
    const next = !long
    setLong(next)
    setLoading(true)
    window.setTimeout(() => {
      const batch = next ? longRuns(LONG_ROWS) : SHORT
      /* the first render of a batch this size costs about a second, and a transition leaves the page alive through it */
      startTransition(() => {
        setRows(batch)
        setLoading(false)
      })
    }, LOAD_MS)
  }

  return (
    <Demo
      bleed
      caption="Drag a divider to resize. Click a head to sort, three times to get the original order back. At 5000 rows the body holds about 30 of them and the rest is spacer height."
    >
      <Table
        rows={rows}
        columns={columns}
        rowId={(run) => run.id}
        title="Sequencing runs"
        noun={['run', 'runs']}
        loading={loading}
        actions={
          <>
            <Button onClick={toggleLong}>{long ? `Back to ${SHORT.length} rows` : `Load ${LONG_ROWS} rows`}</Button>
            <Button onClick={() => setLoading((current) => !current)}>
              {loading ? 'Show the rows' : 'Show the loading state'}
            </Button>
          </>
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
      Past a hundred rows the body renders only what the viewport holds, plus a small buffer, with
      two spacer rows carrying the height of everything else. Below that count nothing changes at
      all. Every row is exactly <Code>--row-h</Code>, so the window is arithmetic rather than
      measurement, which is a payoff of the density scale I did not expect when I set it. Find in
      page will not reach a row that is not rendered, and that is the honest cost. At the sizes where
      this switches on, a browser searching ten thousand rows was not helping anyone either.
    </P>
    <P>
      The frame owns its stacking context. The head at <Code>--z-sticky</Code> and the pinned cells
      under it are ranked inside the table, so neither can tie with the sticky header of the
      application around them. Two elements at one rank are settled by document order, and a table is
      usually the last thing on the page, which decides it the wrong way round.
    </P>
    <P>
      The loading state is the loom threaded and standing still: the warp in the reed with no weft
      through it. Each row adds one <Code>--dur-instant</Code> of delay, so the beat travels down the
      list. The empty state uses the same field and does not move.
    </P>
    <P>
      Tab reaches the body once. The row the cursor is on holds the only stop inside it, so the
      arrows move between rows and Tab leaves the table rather than walking five thousand of them.
      Home and End go to the ends, and Space selects the row under the cursor. A row that is not
      rendered cannot take focus, so past a hundred rows the scroll goes first and focus follows the
      window that answers it. The bindings and what each one measured are on the{' '}
      <a href="/docs/keyboard" className="text-indigo underline underline-offset-2">keyboard page</a>.
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
    {
      name: 'noun',
      type: "string | [one, many]",
      detail: 'What the count calls a row. Give both forms, or one count reads "1 rows". It defaults to "rows".',
    },
    { name: 'loading', type: 'boolean', detail: 'Swaps the rows for the unwoven warp and hides the count.' },
    { name: 'emptyMessage', type: 'string', detail: 'The title of the empty state when no row survives the filters.' },
    { name: 'actions', type: 'ReactNode', detail: 'Controls in the table header, beside the count.' },
    {
      name: 'onSelectionChange',
      type: '(selected: ReadonlySet<string>) => void',
      detail: 'Reports only the selected rows that are currently on screen.',
    },
    { name: 'key (Column)', type: 'string', required: true, detail: 'Identifies the column for sorting and resizing.' },
    { name: 'label (Column)', type: 'string', required: true, detail: 'The head text.' },
    {
      name: 'chars (Column)',
      type: 'number',
      required: true,
      detail: 'The widest plausible value in characters. The density turns it into a width, so never give pixels.',
    },
    {
      name: 'render (Column)',
      type: '(row: T) => ReactNode',
      required: true,
      detail: 'The cell. A function, so a page that declares columns is a client component in Next.',
    },
    { name: 'unit (Column)', type: 'string', detail: 'Stated once in the head, never repeated in a cell.' },
    { name: 'hint (Column)', type: 'string', detail: 'A tooltip on the head button that is already there.' },
    { name: 'numeric (Column)', type: 'boolean', detail: 'Right aligns and sets the data face with tabular figures.' },
    {
      name: 'sortValue (Column)',
      type: '(row: T) => string | number',
      detail: 'Sorts the model, never the text in the cell. Without it the head draws no control.',
    },
  ],
  measured: [
    {
      value: '2232 of 2232',
      what: 'Device columns of the focus band on a row, at DPR 2',
      detail:
        'A row cannot wear the outline every other control gets, because its own cells paint over it and a pinned cell hides what is left. The first reading found a fragment of the bottom edge and nothing else. The band is drawn inside the cells instead, which reaches the pinned ones, and it is unbroken on three of its four device rows.',
    },
    {
      value: '16.7ms to 8.3ms',
      what: 'A scroll frame at 1000 rows, where a browser already copes on its own',
      detail:
        'Compact, ten columns: 12,051 cells in the body become 401. A free frame on this 120Hz display is 8.3ms, so without the window the table misses every second one and holds 60fps, which nobody would file a bug about. This pair replaces a published 22.5ms against 19.6ms that did not reproduce: those were taken at 60Hz, where the windowed reading was sitting on the frame floor and measuring the display rather than the table.',
    },
    {
      value: '1142.4ms to 9.4ms',
      what: 'The longest blocked frame when the batch above lands',
      detail:
        'On the built site, never the dev server. The window used to miss this render entirely: the row height it divides by arrives from an effect, which runs after the commit, so the first render of a batch drew all 5000 rows and settled to 25 on the render after. Windowing that first commit as well takes the median from 1142.4ms to 9.4ms, one frame on this 120Hz display. Without the window it stays at about 1083.4ms. There is a note on this at /notes/row-window.',
    },
    {
      value: '78.1ms to 8.3ms',
      what: 'A scroll frame at 5000 rows, which is what the demo above loads',
      detail:
        'Same method, five times the data: 60,051 cells against 401, with the ninetieth percentile at 81ms and the worst frame at 122.1ms. About thirteen frames a second, which is where the window earns its place. The earlier 84.4ms held on re-measurement; its 18.4ms partner did not, for the display reason above.',
    },
    {
      value: '0px',
      what: 'How far the scroll height is out after a density change, at every density',
      detail:
        'The spacers hold the height of the rows outside the window, so the scrollbar tells the truth. 200040px at comfortable, 160032px at compact, 125025px at dense, all exact. The row height is read off the head row, which keeps its identity; a body row is re-keyed on every scroll and left the observer watching a detached node.',
    },
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
