import type { ReleaseNote } from './types'

/*
 * the registry serves code and hashes, so the sentence explaining a release lives here.
 * a version the registry serves and this file does not name stops the build.
 */
export const RELEASE_NOTES: Record<string, ReleaseNote> = {
  '0.4.1': {
    date: '2026-08-19',
    title: 'The brush answers the keyboard',
    body: 'The plot area takes focus, so you can select a range without a pointer. One arrow press moves one edge by one tick of the x axis, which is 70.07px and two days on the demo. The step is a tick because the axis already draws that distance for the reader. Home and End take the moving edge to the ends of the frame, so either key gives you the whole range from nothing, and Escape clears. The field names its own keys: a rect with a tabindex is reported as a graphics-symbol, and nothing else on the page can say what the arrows do. Two smaller things went in underneath. A caller that widens the range it is handed, the way the demo rounds a window out to whole days, no longer moves the edge the next press starts from. And a resize puts focus back on the plot it rebuilt.',
  },
  '0.4.0': {
    date: '2026-08-19',
    title: 'The chart answers a pointer',
    body: 'Three things land on the chart. A crosshair reads a value off the line under the pointer, and the tick labels stand down while it is showing, because a halo outlines each glyph rather than covering a line and the tick underneath was reading through the gaps between the letters. A brush selects a range: drag across the plot, click once to clear, and the values come back to you so you can filter a table with them. You hold the range rather than the chart, so a resize repaints the same window instead of losing it, which I checked by pulling the plot from 1158px to 878px and back and reading the same width to the last decimal. And the lines draw in on first mount, one series behind the next by 90ms. A pointer is still the only way to make a selection; clearing one has a control, and the keyboard has none yet.',
  },
  '0.3.0': {
    date: '2026-08-19',
    title: 'A chart, and a version range on every dependency',
    body: 'Nineteen items. The chart is an Observable Plot frame in the same shell the table uses, and Plot writes plain SVG, so the tokens style it directly instead of through a theme system of its own. Colours go in as var() references and stay that way in the markup, which is what lets a theme switch repaint a chart with no re-render at all. The series scale is five picks and five is the ceiling. Plot brings d3 with it and added 92.13kB gzipped to this site, measured on the production build with and without the page, so the chart sits beside the twelve controls rather than inside them. This release also gives every item the version range its npm dependencies were written against. A bare package name installed the newest, and Plot is on a 0.x line where a minor release can break a chart. The token file moves in this release, so if you have edited your palette this is the first update that merges into it.',
  },
  '0.2.2': {
    date: '2026-08-18',
    title: 'The panel gives focus back',
    body: 'A panel that leaves the page live is not modal, and Zag returns focus from inside its focus trap, which it only runs for a modal dialog. So closing a panel with Escape dropped a keyboard reader on the body instead of the control they opened it from. The panel now records what had focus and puts it back itself. Trapping focus instead would have fixed the same symptom and broken the reason the panel is not modal.',
  },
  '0.2.1': {
    date: '2026-08-16',
    title: 'The table frame isolates its stacking ranks',
    body: 'A sticky table head and a page header can both claim the same rank, and an equal rank is settled by document order, so the head painted over the header of this very site on three pages. I measured 30.25px of overlap at 1728 by 880. The frame takes isolate, which keeps the ranking inside the table. Raising the header instead would have fixed one site and left the same tie in every application that uses the component.',
  },
  '0.2.0': {
    date: '2026-08-16',
    title: 'A row window for long tables',
    body: 'Past 100 rows the body renders what fits on screen plus six, between two spacer rows carrying the height of everything outside the window. They are spacer rows rather than absolute positioning, because a row taken out of flow loses table-fixed, the sticky head and both pinned columns. At 1000 rows a browser was already coping: 22.5ms per scroll step with every row in the DOM, against 19.6ms with the window. At 5000 it is 84.4ms against 18.4ms, which is where this earns its place. Sorting 5000 rows costs 144ms and keeps your scroll position.',
  },
  '0.1.1': {
    date: '2026-08-16',
    title: 'The row count reads correctly at one',
    body: 'The noun beside a table title can be a pair, so passing run and runs gets you 1 run instead of 1 rows. A single string still works and behaves as it did.',
  },
  '0.1.0': {
    date: '2026-08-16',
    title: 'The first frozen release',
    body: 'Eighteen items: the twelve components, the token file, the icons, and the small pieces they share. Every file has carried a sha256 in the lockfile since this release rather than gaining one later, so nobody who installed on day one is left without a base to merge from.',
  },
}
