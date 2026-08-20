import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

export const RowWindow = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Where a row window starts to pay</PageTitle>
      <Lede>
        The usual advice is to virtualise a table past a few hundred rows. I built a row window for
        mine, then measured what it bought at 1000 rows and at 5000. It buys scrolling. It does
        nothing for the load, which is the half nobody publishes.
      </Lede>
    </header>

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

    <Section id="load" title="The load, which the window does not touch">
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
        Whatever that second is, it is not the rows, and it is not building the data either: the
        click handler that makes the batch and sets the state returns in 0.6ms. I have not pinned
        down where the rest of it goes, and I would rather say that than guess. What I can say is
        that a row window is a scrolling optimisation, and if your complaint is that the table takes
        a second to appear, this is not the fix for it.
      </P>
    </Section>

    <Section id="portable" title="A frame number measures your display too">
      <P>
        There are two numbers on the table's own page that I got wrong, and this is where it showed.
        I published 22.5ms against 19.6ms at 1000 rows, and 84.4ms against 18.4ms at 5000. Today the
        same sweep gives 16.7 against 8.3, and 78.1 against 8.3.
      </P>
      <P>
        The unwindowed figures held. The windowed ones did not, and the reason is the screen rather
        than the code. This machine now drives a 120Hz panel, where a frame with nothing to do costs
        8.3ms instead of 16.7ms. Both of the old windowed readings were sitting on the 60Hz floor and
        measuring the display. The unwindowed readings survived because at 78ms a frame the display
        is nowhere near the limit.
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
            value: '1078.2ms',
            what: 'The longest blocked frame loading 5000 rows, with the window on',
            detail:
              'Without the window it is 1083.4ms. At 1000 rows the pair is 216ms with and 183.4ms without. The window renders 48 rows instead of 5017 and the load does not get cheaper.',
          },
          {
            value: '0.6ms',
            what: 'The click handler that builds the batch and sets the state',
            detail:
              'Four presses, 0.5ms to 0.7ms. So the second the table takes to appear is not the data being made, and it is not the rows being drawn either.',
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
