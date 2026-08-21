import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

export const RowWindow = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Where a row window starts to pay</PageTitle>
      <Lede>
        The usual advice is to virtualise a table past a few hundred rows. I built a row window for
        mine, then measured what it bought at 1000 rows and at 5000. It buys scrolling. I published
        this piece saying it does nothing for the load, and that half was wrong: I was measuring a
        defect in my own window.
      </Lede>
    </header>

    <Section id="correction" title="Correction: the load was a defect in my window">
      <P>
        The row height that the window's arithmetic divides by is measured off a real row by an
        effect, and an effect runs after the commit. Which means the render that landed a new batch
        had no height yet, fell back to drawing every row it was handed, and only settled to 25 on
        the render after. So the windowed table put all 5000 rows in the DOM once, laid out 60,000
        cells, and threw them away. By the time I inspected the DOM it held 48 rows, hence every
        reading below looks like a windowed table that is slow to load.
      </P>
      <P>
        With that first commit windowed too, the longest blocked frame at 5000 rows drops from a
        median of 1142.4ms to 9.4ms, which is one frame on this display. The unwindowed side does not
        move. The conclusion this piece reached, that a row window buys scrolling and nothing else,
        was a measurement of my own bug rather than a property of windowing.
      </P>
      <P>
        I separated the bug from the alternatives three ways before I changed anything. Passing the
        table 25 pre-sliced rows removed the block while all 5000 were still sitting in state, which
        means neither building the rows nor holding them was ever the cost. Clamping the spacers so
        the scroll container was 1080px instead of 200,040px left the block at 1125.1ms. And a second
        load in the same page had always cost one frame, because the measured height survived from
        the first load, so the fix was sitting in a reading I had already recorded and not understood.
      </P>
      <Note>
        I have left the original measurements and reasoning below as they were published. I have not
        re-traced the click since the fix, and the object count in the layout section is the part I
        can no longer square with a render that drew 5000 rows.
      </Note>
    </Section>

    <Section id="setup" title="What I measured">
      <P>
        The same table twice: once as it ships, and once with the window switched off by raising its
        threshold above the row count. Compact density, ten columns, a 120Hz display, and a batch
        loaded by a button that stands in for a fetch with a 450ms pause.
      </P>
      <P>
        Everything below comes from the production build served locally. Never the dev server: the
        same 5000 row batch blocks the main thread for 1511ms through Vite's dev server and 1078.2ms
        from the bundle a user actually gets, so a dev reading overstates it by about 40%.
      </P>
    </Section>

    <Section id="scrolling" title="Scrolling">
      <P>
        At 1000 rows with every row in the DOM the body holds 12,051 cells, and a frame during a
        scroll sweep takes 16.7ms. A free frame on this display is 8.3ms, so the table is missing
        every second one and holding 60fps. It is fine. Nobody would file a bug about it.
      </P>
      <P>
        At 5000 rows it stops being fine. 60,051 cells, and a frame takes 78.1ms with the ninetieth
        percentile at 81ms. That is about thirteen frames a second, which is the difference between a
        table that lags and a table that has stopped answering.
      </P>
      <P>
        With the window on, both sizes put 401 cells in the body and scroll at 8.3ms. That is the
        display's own floor, so there is nothing left in the measurement to look at.
      </P>
    </Section>

    <Section id="load" title="The load, as I first measured it">
      <P>
        Virtualisation is usually sold as the thing that makes a big list fast. So here is the other
        number: the longest single frame the main thread was blocked for after the click.
      </P>
      <P>
        At 1000 rows it is 183.4ms without the window and 216ms with it. At 5000 it is 1083.4ms
        without and 1078.2ms with. The windowed table renders 48 rows instead of 5017 and the load
        costs the same, or a little more.
      </P>
      <P>
        Whatever that second is, it is not building the data: the click handler that makes the
        batch and sets the state returns in 0.6ms. It was the rows, and I had ruled them out on the
        strength of a DOM I read after the table had settled. See the correction at the top.
      </P>
    </Section>

    <Section id="layout" title="It is layout, and it is one event">
      <P>
        The next question is which phase it lands in, so I traced the click. It is layout: a single{' '}
        <Code>Layout</Code> event of 1254.5ms inside a 1600ms task. Paint is 31.6ms across three
        events, <Code>PrePaint</Code> 176ms, <Code>Commit</Code> 98ms, and style recalculation 0.0ms.
      </P>
      <P>
        The layout event's own arguments are where my remaining guess died. Chrome records{' '}
        <Code>dirtyObjects: 19</Code>, <Code>totalObjects: 726</Code> and{' '}
        <Code>partialLayout: false</Code>, rooted at the document. So 726 layout objects, nineteen of
        them dirty, and a second and a quarter. Another <Code>Layout</Code> in the same page over the
        same 726 objects, with 22 dirty, took 0.5ms. Once the table has settled, dirtying the body and
        forcing a synchronous full document layout gives 0.2ms, then 0ms, then 0ms.
      </P>
      <P>
        I read this as the tree size being innocent, and that reading is what kept me looking in
        the wrong place. One pass costing 1.25s and the next pass over the same 726 objects costing a
        fifth of a millisecond is exactly what a render that draws 5000 rows and then settles to 25
        would produce.
      </P>
      <Note>
        A trace inflates what it measures. The same block is 1078.2ms untraced against a 1600ms task
        here, so the split between layout and paint is the finding, not the absolute figures.
      </Note>
    </Section>

    <Section id="portable" title="A frame number measures your display too">
      <P>
        There are two numbers on the table's own page that I got wrong, and this is where it showed.
        I published 22.5ms against 19.6ms at 1000 rows, and 84.4ms against 18.4ms at 5000. Today the
        same sweep gives 16.7 against 8.3, and 78.1 against 8.3.
      </P>
      <P>
        The 5000 row pair held on the unwindowed side: 84.4ms became 78.1ms, and at 78ms a frame the
        display is nowhere near the limit. Neither windowed reading held, and the reason is the screen
        rather than the code. This machine now drives a 120Hz panel, where a frame with nothing to do
        costs 8.3ms instead of 16.7ms, and both of the old windowed readings were sitting on the 60Hz
        floor and measuring the display. The 1000 row pair moved on both sides, 22.5ms to 16.7ms as
        well as 19.6ms to 8.3ms. 16.7ms is exactly two frames on this panel, so that reading is not
        far off the floor either.
      </P>
      <Note>
        A frame interval is only a measurement of your code while your code is the slow part. Publish
        the refresh rate beside it, or the number is not something anybody else can check.
      </Note>
    </Section>

    <Section id="built" title="How the window is built">
      <P>
        Past 100 rows the body renders what the viewport holds plus six, between two spacer rows
        carrying the height of everything outside it. They are spacer rows rather than absolute
        positioning, because a <Code>tr</Code> taken out of flow loses <Code>table-fixed</Code>, the
        sticky head and both pinned columns, and I wanted all three.
      </P>
      <P>
        The row height is read off the head row, not a body row. A body row is re-keyed on every
        scroll, so a <Code>ResizeObserver</Code> on one ends up watching a node that has already been
        detached, and the scroll height stops following the density: at comfortable it reported
        160,272px where it owed 200,040px. The head row carries the same height and keeps its
        identity for the life of the table.
      </P>
    </Section>

    <Section id="numbers" title="Measured">
      <Measured
        rows={[
          {
            value: '16.7ms',
            what: 'A scroll frame at 1000 rows with no window',
            detail:
              '12,051 cells in the body. A free frame on this display is 8.3ms, so it misses every second one and holds 60fps. With the window it is 8.3ms and 401 cells.',
          },
          {
            value: '78.1ms',
            what: 'A scroll frame at 5000 rows with no window',
            detail:
              '60,051 cells, with the ninetieth percentile at 81ms and the worst frame at 122.1ms. About thirteen frames a second. With the window it is 8.3ms, the same as at 1000.',
          },
          {
            value: '1142.4ms to 9.4ms',
            what: 'The longest blocked frame loading 5000 rows, before and after the fix',
            detail:
              'Both with the window on. The first figure is this piece as published, when the first render of a batch was not windowed at all. Windowing it takes the block to one frame. Without the window it stays at about 1083.4ms, and at 1000 rows the published pair was 216ms with and 183.4ms without.',
          },
          {
            value: '0.6ms',
            what: 'The click handler that builds the batch and sets the state',
            detail:
              'Four presses, 0.5ms to 0.7ms. So the second the table took to appear was not the data being made. It was the rows being drawn, all 5000 of them.',
          },
          {
            value: '1254.5ms',
            what: 'One Layout event, over 726 layout objects with 19 dirty',
            detail:
              'Traced from the click, before the fix. Paint is 31.6ms beside it and style recalculation is 0.0ms. A later full document layout over the same 726 objects takes 0.2ms, which I read as the tree size being innocent. The object count was taken after the table had settled to 25 rows.',
          },
        ]}
      />
    </Section>

    <Section id="density" title="Why this table has a fixed row height at all">
      <P>
        The window is arithmetic rather than measurement, and it can be because every row is exactly{' '}
        <Code>--row-h</Code>. That value comes from the density scale: one attribute on the root
        element moves row height, control height, padding and label size together, and every
        component reads it. The window is a side effect of having built that first. You can drive it
        on the <a className="text-indigo underline underline-offset-2" href="/docs/density">density page</a>.
      </P>
    </Section>
  </article>
)
