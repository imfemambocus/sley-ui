import type { ReleaseNote } from './types'

/*
 * the registry serves code and hashes, so the sentence explaining a release lives here.
 * a version the registry serves and this file does not name stops the build.
 */
export const RELEASE_NOTES: Record<string, ReleaseNote> = {
  '0.8.0': {
    date: '2026-08-21',
    title: 'The first render of a long table is windowed too',
    body: "The row window has always cut what the body renders down to what fits on screen, and the one render it missed was the first render of a new batch. The row height comes from an effect that measures a real row, and an effect runs after the commit, which means the render that lands a new batch has no height to divide by, hence the body fell back to drawing every row it was handed. Loading 5000 rows blocked the main thread for about 1.1 seconds while 60,000 cells were laid out and then thrown away for the 25 the window actually wanted. That first commit now renders 40 rows and lets the measurement correct it on the render after. Measured on the built site at 120Hz: The longest blocked frame after the click drops from a median of 1142.4ms to 9.4ms, which is one frame. I checked the diagnosis three ways before I changed anything. Passing the table 25 pre-sliced rows instead of 5000 removed the block while all 5000 were still sitting in state, which means neither building the rows nor holding them was ever the cost. Clamping the spacers so the scroll container was 1080px instead of 200,040px left the block at 1125.1ms, so the tall container wasn't it either. And a second load of a batch in the same page always did cost one frame, because the measured height survived from the first load, so the fix was sitting in that reading before I understood it. 40 rows covers the 520px body cap at the dense row height with the overscan on top, and dense renders 33. The scroll height is still exact at every density, and End still lands on row 5000 at the bottom of the scroll.",
  },
  '0.7.0': {
    date: '2026-08-20',
    title: 'The table body answers the arrow keys',
    body: "Reaching a row without a pointer used to mean tabbing through every control inside every row above it, which is not a thing anyone would do to five thousand rows. Tab now reaches the body once, the arrows move a cursor from row to row, Home and End go to the ends, and Space selects the row the cursor is on. The row the cursor is on carries the only tab stop in the body, so leaving the table and coming back returns you to the row you left. Nothing about the table's role changes: it is still a plain table with focusable rows, so a screen reader keeps its own table reading commands instead of being handed a grid widget that takes them away. The row window made this the interesting part. A row that is not rendered cannot take focus, so End scrolls first, lets the window draw the row it lands on, and puts focus there on the pass after. In a table of 5000 rows that is a scroll to 199,520 of 200,040 and focus on row 5000, and it holds at every density because the arithmetic reads the row height off the head. One thing needed drawing rather than declaring. A row cannot wear the outline every other control gets: its own cells paint over it and a pinned cell hides what is left, so the first reading found a fragment of the bottom edge and nothing else. The ring is drawn inside the cells instead, which is the one place a pinned cell cannot cover it. The token file moves in this release, so if you have edited your palette this update merges into it.",
  },
  '0.6.0': {
    date: '2026-08-19',
    title: 'A chart that can say it has nothing yet',
    body: "A chart spends part of its life with nothing to draw, and it used to draw an empty frame for that. Setting loading puts the warp field in the plot area and beats it, which is what the table already does to its rows. empty puts the empty state there instead, the loom threaded and standing still. Neither is derived, because the chart cannot read your marks and has no way to know whether there is anything in them. The frame holds still between the three states: 297px, 283px and 270px tall at the three densities, the same in every state, with the plot area keeping the exact height you asked for in all nine readings. The chart now depends on the empty state, so adding it brings that item too, and updating an existing install pulls it in as a new item. The token file moves in this release as well, so if you have edited your palette this update merges into it. The crosshair can be formatted now as well. Plot derives each readout from its source channel inside an initializer, and an initializer's channels are merged over the declared ones, so a text of your own never reaches the mark and a date arrives as a full ISO stamp. crosshairX composes the same two pairs out of Plot's own pointer transform and takes formatX and formatY, each a function of the row. Leave both off and it reads the way Plot's does. The demo on the docs site says 29 Jul where it said 2026-07-29. The bars on a chart now build in the way the lines draw in. Each one scales up out of the axis rather than out of its own box, so a stacked column stays whole while it rises, and the sweep across the columns fits inside one --dur-instant whatever the column count. Six columns settle in 295.8ms.",
  },
  '0.5.0': {
    date: '2026-08-19',
    title: 'A downsampler for a line with more points than pixels',
    body: 'The chart item gains downsample, a largest triangle three buckets cut you run over your own data before you hand it to a mark. A fourteen hour trace logged once a second is 50,400 points, and the path drawn from them is 733,477 characters of path data that takes 146.9ms from click to painted frame on the built site. Cut to 1,000 it is 14,632 characters and 16.8ms, and that figure includes the cut. Taking every fiftieth reading instead is one line of code and it reports the plateau where the real peak was 34.03, because a fixed stride steps over a forty second excursion. The extremes are not a guarantee: of 181 targets between 200 and 2000, nine lost the peak, the worst by 1.23 degrees. The chart cannot do this for you, since it has no idea which of your marks is a line, so it is a function rather than a prop.',
  },
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
