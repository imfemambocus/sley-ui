import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

export const RowCursor = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>One tab stop for five thousand rows</PageTitle>
      <Lede>
        A table with 5000 rows in it has to be reachable from the keyboard without becoming 5000 tab
        stops, and without taking a screen reader's own table commands away. This is what I built, and
        the four measurements that decided each part of it.
      </Lede>
    </header>

    <Section id="stops" title="The rows hold one stop between them">
      <P>
        A roving <Code>tabIndex</Code> on the <Code>tr</Code>: the row the cursor is on carries 0 and
        every other row carries -1. Measured on the 5000 row demo with 26 rows rendered, exactly one
        of them is tabbable. One <Code>Tab</Code> press from the last resize grip in the head lands on
        the first body row, and the arrows move from there.
      </P>
      <P>
        The controls inside a row keep their own stops, two per rendered row here, its checkbox and the
        button on its identity cell. That is deliberate. They are controls, a reader expects to reach
        them, and the cursor is for moving between rows rather than for replacing everything a table
        already does.
      </P>
      <P>
        The cursor holds a row id rather than an index. Sorting the table therefore keeps the cursor
        on the same row and not on the same position. Density keeps it too: the cursor was on
        row 5001 before and after all three modes.
      </P>
    </Section>

    <Section id="role" title="What I did not do">
      <P>
        No <Code>role="grid"</Code>, and no <Code>gridcell</Code>. Declaring the table a composite
        widget takes a screen reader out of its own table reading mode, which is the thing that already
        works, and it then owes full cell by cell navigation to be honest about the role it claimed. A
        focusable row inside a native table adds reach without removing any.
      </P>
      <P>
        The row count survives the window: <Code>aria-rowcount</Code> is 5001 and every rendered row
        carries its true <Code>aria-rowindex</Code>, and the position a reader hears is the position
        in the data and not the position in the 26 rows that happen to exist.
      </P>
    </Section>

    <Section id="scroll" title="A row that is not rendered cannot take focus">
      <P>
        Past a hundred rows the body only renders what the viewport holds. Moving the cursor to row
        5000 means scrolling first and focusing on the next view. <Code>End</Code> lands on row 5001 of
        5001 at every density, and it scrolls the frame to exactly its own bottom each time: 199,520 of
        200,040 at comfortable, 159,512 of 160,032 at compact and 124,505 of 125,025 at dense. Each of
        those heights is 5001 rows times the row height of that mode, to the pixel.
      </P>
      <P>
        Every navigation key calls <Code>preventDefault</Code>, or the page scrolls behind the table
        while the cursor moves. With real key presses the page offset held at 218 across every press,
        including <Code>End</Code> at 199,520.
      </P>
      <Note>
        A reading taken in the same frame as a density change catches the old spacer heights. Dense
        reported 161,675px where it owed 125,025px, and settled to the exact figure once the window had
        re-rendered. Wait for the frames before you write the number down.
      </Note>
    </Section>

    <Section id="pointer" title="A pointer scroll drops the focus, and that is accepted">
      <P>
        Scroll with the wheel and the focused row leaves the DOM, dropping focus to the body. Chasing
        it would mean a scroll pulling focus around, which is worse. Instead the tab stop falls back to
        the first row a reader can actually see: at 40,000px the table had 25 rows rendered, exactly one
        tab stop, and it was on row 996, the first of them.
      </P>
    </Section>

    <Section id="ring" title="A row cannot wear the focus ring">
      <P>
        The base <Code>:focus-visible</Code> outline is drawn on the row and then painted over by the
        row's own cells, and a pinned cell hides what is left. My first attempt left four device rows of
        a bottom fragment and nothing over the gutter, which reads as a broken ring rather than as a
        missing one.
      </P>
      <P>
        The band is two inset shadows on each cell instead, and because the shadow belongs to the cell
        it reaches the pinned ones. Scanned at device pixel ratio 2 across the 2232 device columns of a
        focused row: the top band is unbroken across all 2232. The bottom band is unbroken on its first
        two device rows and interrupted on the other two at 22 columns, which are the 11 column dividers
        at two device columns each. The band sits one CSS pixel inside the box, because an inset shadow
        draws inside the cell's own border.
      </P>
      <Note>
        <Code>:focus-visible</Code> does not match a programmatic <Code>focus()</Code> or a dispatched
        <Code>KeyboardEvent</Code>, so none of this can be verified without pressing a real key. Tab
        from the last head grip is the short way in.
      </Note>
    </Section>

    <Section id="numbers" title="Measured">
      <Measured
        rows={[
          {
            value: '1 of 26',
            what: 'Rendered rows that are tabbable',
            detail:
              'The cursor row carries tabIndex 0 and the rest carry -1. Each row keeps two control stops of its own, its checkbox and its identity button.',
          },
          {
            value: '199,520px',
            what: 'Where End leaves the frame at comfortable density',
            detail:
              'Of a 200,040px scroll height with a 520px frame, so exactly the bottom. 159,512 of 160,032 at compact and 124,505 of 125,025 at dense, on row 5001 of 5001 every time.',
          },
          {
            value: '218px',
            what: 'The page offset across every navigation key press',
            detail:
              'It does not move, because every key calls preventDefault. Without that the page scrolls behind the table while the cursor moves inside it.',
          },
          {
            value: '2232 of 2232',
            what: 'Device columns of the focus band that are unbroken',
            detail:
              'The top band at DPR 2. The bottom band is unbroken on two of its four device rows and interrupted at 22 columns on the others, which are the 11 column dividers.',
          },
          {
            value: 'row 996',
            what: 'Where Tab re-enters after a pointer scroll to 40,000px',
            detail:
              'The focused row left the DOM and focus fell to the body, leaving exactly one tab stop, on the first row a reader can see.',
          },
        ]}
      />
    </Section>

    <Section id="drive" title="Drive it">
      <P>
        The demo is on the{' '}
        <a className="text-indigo underline underline-offset-2" href="/components/table">table page</a>,
        and every other binding in the set is on the{' '}
        <a className="text-indigo underline underline-offset-2" href="/docs/keyboard">keyboard page</a>.
      </P>
    </Section>
  </article>
)
