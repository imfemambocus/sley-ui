import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

interface Binding {
  readonly keys: string
  readonly does: string
}

const Keys = ({ rows, caption }: { readonly rows: readonly Binding[]; readonly caption: string }) => (
  <div className="max-w-3xl overflow-x-auto border border-reed bg-raised">
    <table className="w-full border-collapse text-left align-top">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="reed-edge">
          <th scope="col" className="px-4 py-2 font-medium text-weft-dim">
            Key
          </th>
          <th scope="col" className="px-4 py-2 font-medium text-weft-dim">
            What it does
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.keys} className="border-t border-reed/60">
            <td className="px-4 py-2 align-top font-data whitespace-nowrap text-weft">{row.keys}</td>
            <td className="max-w-md px-4 py-2 align-top text-weft-dim">{row.does}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const TABLE_KEYS: readonly Binding[] = [
  { keys: 'Tab', does: 'Moves through the actions, the select all box, then each column head and the grip beside it, then into the body.' },
  { keys: 'Enter, Space', does: 'On a column head, sorts it. Three presses cycle ascending, descending, and back to the order the rows arrived in.' },
  { keys: 'Arrow left, Arrow right', does: 'On a resize grip, moves that column by 8px. The grip is a button, so it needs no pointer.' },
  { keys: 'Arrow down, Arrow up', does: 'On a row, moves the cursor one row and scrolls it into view.' },
  { keys: 'Home, End', does: 'On a row, goes to the first or the last row of the table, however many rows there are.' },
  { keys: 'Space', does: 'On a row, or on its box, selects that row. On the head box, selects and clears every row the filter leaves on screen.' },
  { keys: 'Enter', does: 'On a row, activates it, where the caller passed onRowActivate. Without that prop the row answers nothing.' },
]

const PALETTE_KEYS: readonly Binding[] = [
  { keys: 'Meta K', does: 'Opens the palette from anywhere on the page, and focus lands in the input.' },
  { keys: 'Arrow down, Arrow up', does: 'Moves the cursor through the results. The caret stays in the input, so you can keep typing.' },
  { keys: 'Enter', does: 'Runs the command under the cursor.' },
  { keys: 'Escape', does: 'Closes it and puts focus back on the control that had it before.' },
]

const CHART_KEYS: readonly Binding[] = [
  { keys: 'Tab', does: 'Reaches the plot itself. The frame is the target, so a chart is one stop and not one for each edge of the window.' },
  { keys: 'Arrow left, Arrow right', does: 'Moves one edge of the window by one tick of the x axis. The first press anchors on the frame edge it moves away from.' },
  { keys: 'Home, End', does: 'Takes the moving edge to the left or the right end of the frame. From nothing, either key selects the whole range.' },
  { keys: 'Escape', does: 'Clears the window. A pointer clears one with a single click, and the keyboard has no click.' },
]

const LAYER_KEYS: readonly Binding[] = [
  { keys: 'Escape', does: 'Closes a dialog, a panel, a popover or a select.' },
  { keys: 'Tab', does: 'Cycles inside a dialog, which is modal. A panel is not modal above 640px, so Tab leaves it and carries on down the page.' },
  { keys: 'Escape, then nothing', does: 'Focus goes back to the control the layer was opened from, so a reader keeps their place in the row they came from.' },
]

export const Keyboard = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Keyboard</PageTitle>
      <Lede>
        A dense table is where a pointer costs the most. Everything in it is reachable without one.
        Every binding below was driven in a browser and the result read back off the page.
      </Lede>
    </header>

    <Section id="table" title="The table">
      <Keys rows={TABLE_KEYS} caption="Keys the table answers" />
      <P>
        The resize grip is a real <Code>button</Code> rather than a bare element with a pointer
        handler, which is the whole reason a key press can reach it. The column head holds two
        buttons side by side, the label and the grip, so <Code>Tab</Code> reaches each one on its own
        and neither is nested in the other.
      </P>
      <P>
        Tab reaches the body once. The row the cursor is on holds the only stop inside it, so leaving
        the table and coming back returns you to the row you left instead of to the top. The table's
        role does not change for any of this. It is still a plain table with focusable rows, so a
        screen reader keeps its own table reading commands rather than being handed a grid widget
        that takes them away.
      </P>
      <P>
        The hard part is that a row which is not rendered cannot take focus. Past a hundred rows the
        table draws only what the viewport holds, so <Code>End</Code> has nothing to focus at the
        moment the key goes down. The scroll happens first, the window draws the row it lands on, and
        focus follows on the pass after that.
      </P>
      <Note>
        The third press on a column head is worth knowing about. It clears the sort rather than
        cycling back to ascending, so the order the rows arrived in is a state you can return to.
      </Note>
    </Section>

    <Section id="palette" title="The command palette">
      <Keys rows={PALETTE_KEYS} caption="Keys the command palette answers" />
      <P>
        The palette on this site is the component, with every page in it as a command. The arrows move
        a cursor rather than focus, so the caret never leaves the input and a search can be refined
        after the cursor has moved.
      </P>
    </Section>

    <Section id="chart" title="The chart">
      <Keys rows={CHART_KEYS} caption="Keys the chart brush answers" />
      <P>
        The target is the plot area, not a handle on each edge, so a chart is one tab stop and the
        arrows do the rest. The step is a tick of the x axis because the axis already draws that
        distance; a step of my own choosing would be a number the reader has no way to see. On the
        chart page it is two days.
      </P>
      <Note>
        The field is an SVG rect with a <Code>tabindex</Code>, and Chrome reports it as a
        graphics-symbol instead of a control. The accessible name has to carry the keys, since
        nothing else on the page can. That is also the limit of what a screen reader gets here: the
        range goes to the caller and appears in the header, and no announcement follows the window
        while it moves.
      </Note>
    </Section>

    <Section id="layers" title="Dialogs, panels and popovers">
      <Keys rows={LAYER_KEYS} caption="Keys the layers answer" />
      <P>
        The panel is the interesting one. It reads a row while the table behind it stays live, so it
        takes no focus trap and no scroll lock above 640px: <Code>aria-modal</Code> is false and the
        body keeps scrolling. Below 640px it covers the page, so it becomes modal and traps focus like
        a dialog.
      </P>
      <Note>
        Ark returns focus from inside its focus trap, and it only runs that trap for a modal dialog,
        so a panel has to hand focus back itself. It records what had focus when it opened and
        restores it on close. Trapping focus instead would fix the same symptom and remove the reason
        the panel is not modal.
      </Note>
    </Section>

    <Section id="measured" title="Measured">
      <Measured
        rows={[
          {
            value: 'row 5001',
            what: 'Where End lands in a table of 5000 rows',
            detail:
              'That row did not exist when the key went down. The container scrolled to 199,520 of 200,040, the window drew the row, and focus landed on it inside the frame. The same press works at every density, because the scroll arithmetic reads the row height off the head row: 200,040px, 160,032px and 125,025px of scroll.',
          },
          {
            value: '30 of 30',
            what: 'Rows moved by thirty presses of the down arrow',
            detail:
              'Row 1 to row 31, with the container scrolling from 0 to 760px underneath, and every row sampled along the way sitting inside the frame. The page behind it never moved, because each press is stopped from doing anything else.',
          },
          {
            value: '2232 of 2232',
            what: 'Device columns of the focus band on a row, at DPR 2',
            detail:
              'A row cannot wear the outline every other control gets. Its own cells paint over it and a pinned cell hides what is left, so the first reading found a fragment of the bottom edge and nothing else. The band is drawn inside the cells instead, and it runs unbroken across the row on three of its four device rows. The fourth carries eleven single ticks of the column reed.',
          },
          {
            value: '8px',
            what: 'One arrow press on a resize grip',
            detail:
              'A column flowed to 82.59px went to 91px on the first press, because the grip reads the rendered width and rounds it to a whole pixel before it adds the step. The next press gave exactly 99px.',
          },
          {
            value: '3 states',
            what: 'A column head under repeated Enter',
            detail:
              'aria-sort read none, then ascending, then descending, then none again, and the first cell went R-4821, R-4813, R-4821, R-4821. The third press restores the arrival order rather than the ascending one.',
          },
          {
            value: '9 of 9',
            what: 'Space on the head checkbox',
            detail:
              'The count line and the rows agreed: nine rows carried the selected state and the header read 9 of 9 selected. A second press cleared both.',
          },
          {
            value: 'both modes',
            what: 'Focus after a panel closes',
            detail:
              'With the trigger focused, Enter opened the panel and Escape closed it, and focus was back on the trigger. Checked at 1600px where the panel is not modal, and under 640px where it is, since a different mechanism returns it in each case.',
          },
          {
            value: '70.07px',
            what: 'One arrow press on the chart brush',
            detail:
              'The fifteen x axis ticks sit 70.0689697265625px apart on the chart page at 1728px wide, and the second and third presses each moved the edge exactly that far. Two days on that axis.',
          },
          {
            value: 'whole range',
            what: 'Home or End on an empty plot',
            detail:
              'Both gave 14 July to 12 August, the full thirty days, from nothing. Home anchors on the right edge of the frame and End on the left, so whichever key you press first, the other end is already where it needs to be.',
          },
          {
            value: '15 of 27',
            what: 'Rows left after one press on the home page chart',
            detail:
              'End selected the whole month and left all 27 runs in the table. One press of the left arrow ended the window on 10 August and the table fell to 15. Escape brought all 27 back.',
          },
          {
            value: 'returned',
            what: 'Focus after the palette closes',
            detail:
              'With the select all checkbox focused, Meta K opened the palette, Escape closed it, and focus was back on that same checkbox rather than on the body.',
          },
        ]}
      />
    </Section>
  </article>
)
