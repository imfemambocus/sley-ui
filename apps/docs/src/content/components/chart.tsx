import { useState } from 'react'
import { QualityChart, type DayRange } from '@demo/QualityChart'
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
      A crosshair is a mark you add rather than a prop you set. Plot names its parts{' '}
      <Code>crosshair rule</Code> and <Code>crosshair text</Code>, so the stylesheet reaches them and
      any chart that adds one gets the reed colour and the data face without asking for either. The
      readout is the raw value, which is why a date arrives in full.
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
      Five picks is the ceiling of the series scale. A pick is one pass of the weft through the shed,
      and the banner motif carries five. Past five I cannot tell two lines apart in the dark theme.
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
      value: '3 of 3',
      what: 'Chart colours that repaint on a theme switch with no re-render',
      detail:
        'The stroke attributes stay as var(--color-pick-1) to var(--color-pick-3) in the DOM. The computed values moved from rgb(95,114,239), rgb(79,168,139) and rgb(201,162,39) to rgb(58,73,196), rgb(47,122,97) and rgb(138,111,18) across the cross fade.',
    },
  ],
  Notes,
}
