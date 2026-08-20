import { useState } from 'react'
import { ChartStates } from '@demo/ChartStates'
import { QualityChart, type DayRange } from '@demo/QualityChart'
import { RunMixChart } from '@demo/RunMixChart'
import { TraceChart } from '@demo/TraceChart'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const ChartDemo = () => {
  const [range, setRange] = useState<DayRange | null>(null)

  return (
    <Demo
      bleed
      caption="Q30 by assay over 30 days. Drag across it to brush a range, or tab to the plot and move an edge with the arrow keys. A click or Escape clears. The madder rule is the quality floor the table draws its reed under."
    >
      <QualityChart range={range} onRangeChange={setRange} />
    </Demo>
  )
}

const TraceDemo = () => (
  <Demo
    bleed
    caption="One flow cell, one reading a second for fourteen hours. The header control switches between the thousand points the frame can resolve and all 50,400 of them."
  >
    <TraceChart />
  </Demo>
)

const RunMixDemo = () => (
  <Demo
    bleed
    caption="The 27 runs the table holds, counted by assay and stacked by status. A band scale has no inverse, so this one takes no brush."
  >
    <RunMixChart />
  </Demo>
)

const StatesDemo = () => (
  <Demo
    bleed
    caption="The three states of the same chart. The warp field beats while a fetch is out, and stands still when it comes back with nothing."
  >
    <ChartStates />
  </Demo>
)

const Notes = () => (
  <>
    <P>
      Observable Plot writes plain SVG, which is why I picked it over a canvas library. A canvas chart
      cannot be reached by the stylesheet that styles everything else on the page.
    </P>
    <P>
      Plot brings d3 with it, and that is the one real cost. Adding this page took the site from
      175.47kB to 267.60kB gzipped. That is why the chart sits beside the twelve controls rather than
      inside them: it should be something you choose, not something a table hands you.
    </P>
    <P>
      The wrapper does not know what a line is. It builds the plot, styles it, and gives you the
      interactions back; the marks are yours. The bars below are this same component over the same 27
      runs the table holds, coloured by the status dye each row already carries. A band scale cannot
      be inverted, though, so there is no brush on that one and nothing to tab to. The wrapper asks
      the x scale for its inverse and leaves the chart alone when there is none.
    </P>
    <RunMixDemo />
    <P>
      Plot puts the font and the fill on the root svg as presentation attributes. Any stylesheet rule
      outranks those, so the type comes from the tokens instead. Tick labels are machine values and
      take the data face. An axis label is a human phrase and takes the interface face. The size
      follows the density knob: 14px, 13px, 12px.
    </P>
    <P>
      The colours go in as <Code>var()</Code> references and stay that way in the markup. I checked
      what a theme switch does to them. In the dark the three lines read rgb(95,114,239),
      rgb(79,168,139) and rgb(201,162,39); in the light, rgb(58,73,196), rgb(47,122,97) and
      rgb(138,111,18), with no re-render in between. Resolve the tokens to hex in JavaScript and the
      chart keeps the old palette after the fade.
    </P>
    <P>
      The unit sits in the header. That is the table's rule: a column head carries the unit, and a
      cell never repeats it. An axis label with a unit on it puts the same repetition somewhere else.
      Plot also points a quantitative axis label with an arrow glyph by default; nothing here carries
      one, and the wrapper turns it off.
    </P>
    <P>
      A margin is a number and cannot read a density token, so I sized the margins for the largest
      density and let a denser mode keep the slack. My first set was 1.44px short at comfortable: the
      date labels hung out of the bottom of the frame. 40px clears them at all three densities, with
      2.56px to spare at the worst.
    </P>
    <P>
      Some of a chart's life is spent with nothing to draw yet. Setting <Code>loading</Code> puts the
      warp field in the plot area and beats it, which is what the table does to its rows.{' '}
      <Code>empty</Code> puts the empty state there instead, the loom threaded and standing still. If
      both are set, loading wins: a chart still waiting on a fetch has nothing to call empty yet.
      Neither state is derived, because the chart cannot read your marks and has no way to know
      whether there is anything in them. The lines still draw in when the data lands, since the first
      plot is only built once the skeleton has left.
    </P>
    <StatesDemo />
    <P>
      A crosshair is a mark you add rather than a prop you set. Plot names its parts{' '}
      <Code>crosshair rule</Code> and <Code>crosshair text</Code>, so the stylesheet reaches them and
      any chart that adds one gets the reed colour and the data face without asking for either. The
      readout is the raw value, which is why a date arrives in full.
    </P>
    <P>
      That last part I could not fix from the outside. Plot derives each readout from its source
      channel inside an initializer, and an initializer's channels are merged over the declared ones,
      so a <Code>text</Code> of your own is discarded before the mark ever sees it.{' '}
      <Code>crosshairX</Code>, at <Code>@/components/ui/chart/crosshair</Code>, composes the same two
      pairs from Plot's own pointer transform and takes <Code>formatX</Code> and <Code>formatY</Code>,
      each a function of the row. Leave both off and it reads the way Plot's own does. The chart at
      the top of this page formats the date as 12 Aug; the trace below prints the clock.
    </P>
    <P>
      While a readout is showing, the tick labels stand down. A halo outlines each glyph rather than
      covering a line, so a readout landing on a tick label let the tick read through the gaps between
      the letters: I measured 12.92px of a 17px line box overlapping. The readout carries the exact
      value the axis was giving, so the axis has nothing to add for as long as it is there.
    </P>
    <P>
      The halo behind that readout was white, and it stayed white through a rule that should have
      beaten it. Plot ships a <Code>&lt;style&gt;</Code> element inside the svg, and an unlayered rule
      outranks a layered one whatever the specificity says. So <Code>--plot-background</Code> is one of
      the few declarations here that has to shout. It sets the fill of a <Code>Plot.tip</Code> as well.
    </P>
    <P>
      Drag across the plot to brush a range, and click once to clear it. The chart reports the values
      and you hold them: <Code>brush</Code> paints the window, <Code>onBrush</Code> says when it moved.
      That is the table's arrangement, where a selection is reported and the caller owns the set.
    </P>
    <P>
      The window is one rect under every mark, so the lines read through it instead of vanishing
      behind it. Holding the range outside the chart is also what stops a re-render losing it. Pulling
      the plot from 1158px down to 878px repainted the same range at the new scale, the table stayed on
      its 7 rows, and widening it again gave the window back its original width to the last decimal.
    </P>
    <P>
      The plot takes focus, so you can select a window without a pointer. One arrow press moves one
      edge by one tick of the x axis, 70.07px and two days on this chart. The step is a tick because
      the axis already draws that distance for the reader; a number of my own would be one nobody can
      see. Home and End take the moving edge to the ends of the frame, and from nothing either key
      gives you the whole range. Escape clears. The first press anchors on the frame edge it moves
      away from, the way a drag anchors wherever the pointer went down.
    </P>
    <P>
      A press reports the range a drag would report, and the demo rounds it out to whole days before
      it comes back. That widening belongs to the caller, so the chart paints it and leaves its own
      moving edge where the press put it. Read the edge back out of the range and the widening rides
      on the next press as well as the step: three days for a two day tick.
    </P>
    <P>
      The field is a rect with a tabindex and a name. Chrome reports it as a{' '}
      <Code>graphics-symbol</Code>, not as a control, and it carries no value, which leaves the
      accessible name as the only thing that can say what the keys do. Nothing announces the window
      while it moves. The header control is the readout, and a reader who cannot see it gets no
      running commentary.
    </P>
    <P>
      A resize rebuilds the plot and takes the focused field down with it, so the chart puts focus on
      the one it draws next. The new brush has only the range the caller holds to work from, and that
      range has been rounded out, which makes the first press after a resize move three days once
      before the step settles back to two.
    </P>
    <P>
      The lines draw in once, on the first mount. A dash cannot be given the length of its own path
      from a stylesheet, so the wrapper measures each path and hands the number to the animation as a
      custom property. The three series are staggered by <Code>--dur-instant</Code>, which is what the
      loading skeleton does to its rows. A resize rebuilds the plot and does not replay it, because a
      figure that redraws itself every time the window moves reads as a glitch.
    </P>
    <P>
      The bars build the same way. Each one scales up out of the axis rather than out of its own box,
      so a stacked column stays whole while it rises: every rect shares one baseline, the lowest edge
      any of them reaches. The sweep across the columns fits inside one <Code>--dur-instant</Code>{' '}
      whatever the column count, so a chart with forty bars sweeps in the same time as one with six.
      On the bar demo the six columns started at 5, 6.8, 21.5, 37.9, 54.4 and 71.4ms and everything
      had settled by 295.8ms.
    </P>
    <P>
      Five picks is the ceiling of the series scale. A pick is one pass of the weft through the shed,
      and the banner motif carries five. Past five I cannot tell two lines apart in the dark theme.
    </P>
    <P>
      The legend in the header is yours, and hiding a series is a filter on your own data. Mine is a
      row of buttons carrying <Code>aria-pressed</Code>, so a key press reaches it like anything else.
      It hides a line and nothing more; narrowing the rows underneath is the brush's job, and the
      console on the home page keeps the two apart. Two scales have to be pinned before any of it
      works. The colour scale takes its domain from the data it is given, and hiding the middle series
      then hands its pick to the one below it. Declare <Code>domain</Code> and <Code>range</Code>{' '}
      together and every line keeps its colour. The x scale does the same, and there it is worse: the
      frame shrinks to what is left, and a window the reader brushed moves under them. Both are
      declared from the whole fixture here.
    </P>
    <P>
      A line with more points than the frame has pixels spends its time on detail nobody can resolve.{' '}
      <Code>downsample</Code> cuts a series to a target count with largest triangle three buckets. It
      walks the points in equal buckets and keeps whichever one makes the widest triangle with the
      point it kept last and the average of the group ahead. Taking every nth point is one line of
      code and it loses the thing you were looking at. The cooler stalled for forty seconds in the
      trace below and the flow cell reached 34.03. Every fiftieth reading reports 30.08, which is the
      plateau, because the excursion falls between two samples.
    </P>
    <TraceDemo />
    <P>
      The extremes are not a guarantee. I ran 181 targets from 200 to 2000 over that fixture: 172 kept
      the peak to the decimal and 9 lost it, the worst of them reading 32.8. A bucket boundary can
      split a peak, and the peak then loses to its own shoulder. If a maximum must never move, keep
      the smallest and largest of each bucket instead and pay for the extra points.
    </P>
    <P>
      The chart does not do this for you, and it cannot: it does not know which of your marks is a
      line or which field holds the value. It is a function you run over your own data, beside the{' '}
      <Code>useMemo</Code> you already need to hold the options stable, and it arrives with the chart
      at <Code>@/components/ui/chart/downsample</Code>.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'chart',
  name: 'Chart',
  summary: 'An Observable Plot frame the tokens style directly, in the same shell the table uses.',
  exports: ['Chart', 'type ChartOptions'],
  Demo: ChartDemo,
  api: [
    { name: 'title', type: 'string', required: true, detail: 'The heading in the chart header.' },
    { name: 'unit', type: 'string', detail: 'Stated once beside the title, never on the axis and never in the plot.' },
    {
      name: 'options',
      type: 'ChartOptions',
      required: true,
      detail:
        'Plot options without width, height and className. Hold it stable with useMemo, or every parent render tears the plot down and builds it again.',
    },
    { name: 'height', type: 'number', detail: 'The plot height in pixels. It defaults to 260.' },
    { name: 'actions', type: 'ReactNode', detail: 'Controls in the chart header. The demo above puts its legend there.' },
    {
      name: 'loading',
      type: 'boolean',
      detail: 'Draws the warp field in the plot area and beats it. It wins over empty when both are set.',
    },
    {
      name: 'empty',
      type: 'boolean',
      detail:
        'Draws the empty state in the plot area. The chart cannot read your marks, so an empty result is stated rather than derived.',
    },
    { name: 'emptyMessage', type: 'string', detail: 'The line the empty state carries. It defaults to "No data in this range."' },
    {
      name: 'brush',
      type: 'readonly [X, X] | null',
      detail: 'The window the chart paints. Hold it in your own state, the way a table selection works.',
    },
    {
      name: 'onBrush',
      type: '(range: readonly [X, X] | null) => void',
      detail:
        'Reports a range in the values of the x scale, from a drag or from an arrow key on the plot, and null when a click or Escape clears it.',
    },
  ],
  measured: [
    {
      value: '14px / 13px / 12px',
      what: 'The axis type at comfortable, compact and dense',
      detail:
        'Read off the rendered svg. Plot writes font-size as a presentation attribute, so one stylesheet rule takes it back and the chart follows the knob with no re-render.',
    },
    {
      value: '1.44px',
      what: 'How far the date labels hung out of the frame on the first try',
      detail:
        'A margin is a number and cannot read a density token, so the first set was sized too tight for comfortable. 40px at the bottom clears every density, and the worst case keeps 2.56px inside the frame.',
    },
    {
      value: '22.3px',
      what: 'What the widest y tick label leaves inside the 56px left margin, at comfortable',
      detail:
        'Those labels are 25.2px wide, and they narrow to 23.41px and 21.61px as the knob tightens. Every clearance stays positive at all three densities, and the tightest of them is the 2.56px under the dates above.',
    },
    {
      value: '1, 1, 0',
      what: 'Brush fields on the two line charts and on the bars',
      detail:
        'A band scale has no inverse, so the wrapper asks for one, does not get it, and leaves the chart as a chart. Nothing errors and nothing takes focus.',
    },
    {
      value: '0px',
      what: 'How far the frame moves between loading, empty and drawn',
      detail:
        'The chart is 297px, 283px and 270px tall at comfortable, compact and dense, and each of those holds across all three states. The plot area keeps the 220px that demo asks for in all nine readings, so nothing below the chart shifts when the data lands.',
    },
    {
      value: '29 Jul',
      what: "The crosshair readout where Plot's own prints 2026-07-29",
      detail:
        'The same pointer position on the same chart, one option apart. On the trace below it reads 13:28:40 where Plot gives 2026-08-06T13:28:40Z, 8 characters against 20.',
    },
    {
      value: '92.13kB',
      what: 'What Plot adds to this site, gzipped',
      detail:
        'The docs bundle went from 568.23kB to 839.87kB raw, and from 175.47kB to 267.60kB gzipped, measured on the production build with and without the chart page. Plot brings d3 with it. Add the chart only if you want a chart.',
    },
    {
      value: '240ms, staggered 90ms',
      what: 'The line draw, sampled once per animation frame while it ran',
      detail:
        'The first path travelled its full 1103.68px of dash to 0 over 240ms on the beat curve. The second held at 1111.13 until 90ms and the third at 1212 until 180ms, so the series follow one another and the figure settles at about 420ms. Reduced motion sets every duration to 0ms in one place and the lines simply appear.',
    },
    {
      value: '295.8ms',
      what: 'How long six columns of bars take to build',
      detail:
        'They start at 5, 6.8, 21.5, 37.9, 54.4 and 71.4ms, because the sweep across the columns fits inside one --dur-instant however many there are. Sampled once per animation frame from the first frame the bars existed.',
    },
    {
      value: '0.0001px',
      what: 'The largest gap between two stacked segments while their column rises',
      detail:
        'Every rect scales about one baseline, the axis, rather than about its own box, which is what keeps a stacked column whole on the way up. Read over 61 frames while the column travelled from 0 to 164px.',
    },
    {
      value: '7 of 27',
      what: 'Runs left in the table after brushing 30 July to 8 August',
      detail:
        'The chart reports the dates, the demo widens them to whole days, and the table filters on the run stamp. Clicking once on the plot clears the window and all 27 come back.',
    },
    {
      value: '374.48px',
      what: 'The window width before and after a resize round trip',
      detail:
        '374.4827581872605px both times, identical to the last decimal. The plot went from 1158px to 878px and back, and the window was repainted from the range the caller holds rather than kept as pixels, so the table never left its 7 rows.',
    },
    {
      value: '6.1ms',
      what: 'The median frame while the theme cross fade runs on this page',
      detail:
        'Measured on the built site, not the dev server: 6.1ms into the light and 6.0ms back, with 1 frame of 113 over 16.7ms each way. The chart adds 69 nodes to the snapshot and the fade does not feel them.',
    },
    {
      value: '70.07px',
      what: 'One arrow press on the plot, which is one tick of the x axis',
      detail:
        'The fifteen ticks sit 70.0689697265625px apart at 1728px wide. Three presses grew the window by 105.10px, then 70.07px, then 70.07px. The first is larger because the demo rounds the end out to the last millisecond of the day it lands in, so the window covers three days while the edge moved two.',
    },
    {
      value: '27, 15, 2',
      what: 'Runs left in the home page table as the left arrow narrows the window',
      detail:
        'End took the window to the whole thirty days and all 27 runs stayed. One press of the left arrow ended it on 10 August and left 15, three presses ended it on 6 August and left 2, and Escape brought all 27 back. The runs cluster at the end of the month, which is why one press costs twelve rows.',
    },
    {
      value: 'graphics-symbol',
      what: 'What the accessibility tree reports for the focusable field',
      detail:
        'Chrome maps a named, focusable SVG rect to graphics-symbol. It is not exposed as a control and it holds no value, which is why the name carries the keys: "Select a range on Q30 by assay. Move an edge with the arrow keys. Escape clears." Nothing announces the range while it moves.',
    },
    {
      value: '2px at 1px',
      what: 'The focus ring on the plot, which needed no rule of its own',
      detail:
        'The site ring reaches an SVG rect unaided. Read off a screenshot at device pixel ratio 2: four rows of rgb(95,114,239) on all four sides of the field, one CSS pixel outside its box.',
    },
    {
      value: '50,400 to 1,000',
      what: 'What the downsample keeps, and what the line costs at either size',
      detail:
        'The path data went from 733,477 characters to 14,632, which is 50.1 times. On the built site the click to the painted frame is a median of 142.3ms with every reading and 8.4ms downsampled, and the second figure includes the cut itself. That pair replaces a published 146.9ms against 16.8ms: the slow figure held on re-measurement and the fast one was two frames on a 60Hz panel, where 8.4ms is one frame at 120Hz.',
    },
    {
      value: '34.03',
      what: 'The peak the cut keeps, where every fiftieth reading reports 30.08',
      detail:
        'The cooler stalled for forty seconds and the flow cell reached 34.03. A fixed stride steps over the excursion and reports the plateau it sits on. The widest triangle in that bucket is the excursion, so the cut takes it.',
    },
    {
      value: '172 of 181',
      what: 'Targets between 200 and 2000 that kept that peak to the decimal',
      detail:
        'Nine lost it and the worst read 32.8 against 34.03. A bucket boundary can split a peak, and the peak then loses to its own shoulder. Keep the smallest and largest of each bucket instead if a maximum must never move.',
    },
    {
      value: '8.3ms',
      what: 'The frame while the crosshair sweeps the trace, at either size',
      detail:
        'Thirty pointer moves, one an animation frame, on the built site: 8.3ms median over 1,000 points and 8.3ms over 50,400. Plot looks for the nearest point on every move, and that search is not what costs anything here. The draw is.',
    },
    {
      value: '105.10px',
      what: 'A brushed window while a series is hidden and shown again',
      detail:
        '105.10344787037036px before the legend toggle, while the series was off, and after it came back. Hiding a series rebuilds the plot, so the x domain is declared from the whole fixture and the frame cannot move under a window the reader made.',
    },
    {
      value: '3.0kB',
      what: 'What this release adds to the site, gzipped, prose and all',
      detail:
        'The bundle went from 859.45kB to 867.30kB raw and from 274.7kB to 277.7kB gzipped, which covers the downsampler, the second demo, its fixture and every word on this page. The gzipped figure is quoted to one decimal because publishing it changes it. The fixture is generated rather than shipped, and it is built on first use, because the site ships one bundle and the other twenty five pages have no use for fifty thousand dates.',
    },
    {
      value: '3 of 3',
      what: 'Chart colours that repaint on a theme switch with no re-render',
      detail:
        'The stroke attributes stay as var(--color-pick-1) to var(--color-pick-3) in the DOM. The computed values moved from rgb(95,114,239), rgb(79,168,139) and rgb(201,162,39) to rgb(58,73,196), rgb(47,122,97) and rgb(138,111,18) across the cross fade.',
    },
  ],
  Notes,
}
