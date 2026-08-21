import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

export const ThemeFade = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>A theme fade that animates five things</PageTitle>
      <Lede>
        The obvious way to make a theme switch fade is to transition the colours on every element. I
        built that, it felt slow, and the measurement said why: on this site's home page it starts
        3164 animations. A view transition does the same job with five, and the reason it wins is not
        the one I published the first time.
      </Lede>
    </header>

    <Section id="setup" title="What I measured">
      <P>
        Two versions of the same switch on the same pages of the built site, sampling every frame for
        sixty frames after the click. The first is what ships: <Code>startViewTransition</Code> with
        the palette swapped inside the callback. The second adds one blanket rule transitioning
        background colour, border colour, colour and box shadow on every element and pseudo element,
        which is the version I wrote first.
      </P>
      <P>
        A free frame on this display is 8.3ms, which leaves the median uninteresting. Watch the
        count of frames that missed 16.7ms, and watch the worst one.
      </P>
    </Section>

    <Section id="counts" title="Five animations against 3164">
      <P>
        Under the view transition the browser animates snapshots of the whole page, and it holds five
        animations while it does:{' '}
        <Code>::view-transition-group(root)</Code>, and an old and a new for the root, twice over. The
        page cross fades as a picture. A gradient fades with everything else instead of snapping,
        which a property transition cannot do at all, because a gradient does not interpolate.
      </P>
      <P>
        The blanket rule instead starts 3164 animations on a page holding 1544 elements. The cost
        follows the element count and nothing else. On the table page, 735 elements, it is 1521. On
        the density page, 545 elements, it is 1040. Cutting the property list is not the answer,
        because the list is not what is expensive.
      </P>
      <Note>
        The site is not free of per element transitions either way. 636 elements animate their own
        colours during the cross fade, because they carry a <Code>transition-colors</Code> utility for
        their hover state, and a palette change is a colour change. The blanket rule is what takes
        that from 636 to 3164.
      </Note>
    </Section>

    <Section id="frames" title="Where the two versions separate">
      <P>
        On the home page the cross fade misses one frame in sixty, and its worst frame is 16.8ms going
        into the light theme and 32.6ms coming back. The blanket rule misses seven and nine, and its
        worst frames are 51ms and 81.8ms. The table page tells the same story: one missed frame
        against ten and thirteen.
      </P>
      <P>
        Both medians read 8.3ms, which is the floor of this display. So the median cannot tell these
        two apart, and if the median were all I had published, I would have shipped the slow one.
      </P>
    </Section>

    <Section id="correction" title="A number I had published, corrected">
      <P>
        The first time I measured this, in August, I had 23.1ms median against 8.3ms, on a page with
        1466 elements and 2914 animations. The element and animation counts reproduce almost exactly.
        The median does not, and the reason is the screen: that reading was taken at 60Hz, where a
        free frame is 16.7ms, and a page dropping every second frame lands near 23ms. On a 120Hz panel
        both versions sit on 8.3ms and the difference moves into the tail.
      </P>
      <P>
        The conclusion did not change and the evidence for it did. That is worth saying out loud,
        because a frame interval is only a measurement of your code while your code is the slow part.
      </P>
    </Section>

    <Section id="numbers" title="Measured">
      <Measured
        rows={[
          {
            value: '5',
            what: 'Animations the cross fade runs for the whole page',
            detail:
              'One group and two old and two new on the root pseudo elements. The page fades as a picture, so gradients fade with it.',
          },
          {
            value: '3164',
            what: 'Animations the blanket property rule starts on the same page',
            detail:
              '1544 elements, four properties. 1521 on the table page at 735 elements and 1040 on the density page at 545, so the element count is the cost.',
          },
          {
            value: '1 of 60',
            what: 'Frames over 16.7ms during the cross fade',
            detail:
              'Home page, worst frame 16.8ms into the light theme and 32.6ms back. The blanket rule misses 7 and 9 of 60, worst 51ms and 81.8ms.',
          },
          {
            value: '8.3ms',
            what: 'The median frame under both versions',
            detail:
              'The floor of a 120Hz display. At 60Hz the blanket version read 23.1ms median, which was the display and not the code, and the counts above are what actually separate them.',
          },
          {
            value: '0.24s',
            what: 'What the fade is allowed to take',
            detail:
              'The --dur-overlay token, read by the view transition pseudo elements, so the token layer still owns the timing. Reduced motion sets it to 0ms and the switch takes the plain path.',
          },
        ]}
      />
    </Section>

    <Section id="drive" title="Drive it">
      <P>
        The control is in the header on every page of this site, and the tokens it moves are listed on
        the <a className="text-indigo underline underline-offset-2" href="/docs/motion">motion page</a>.
      </P>
    </Section>
  </article>
)
