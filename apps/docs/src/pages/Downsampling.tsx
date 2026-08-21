import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

export const Downsampling = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Largest triangle three buckets, and the peak it loses</PageTitle>
      <Lede>
        Fifty thousand readings do not fit in a thousand pixels. Something has to go. Taking every
        fiftieth reading loses the one event the chart exists to show. The algorithm that keeps the
        shape mostly keeps that event too, and I can tell you exactly how often it does not.
      </Lede>
    </header>

    <Section id="fixture" title="The fixture is built around one event">
      <P>
        Fourteen hours of a flow cell temperature logged once a second, 50,400 readings, holding at 30
        degrees. At 26,000 seconds the cooler stalls for forty seconds and the reading climbs to 34.03.
        The stall is narrower than a fiftieth of the series, which is the whole point of it.
      </P>
      <P>
        A stride keeps 1008 points and reports 30.08 at the moment of the peak. It is not that the
        excursion is smoothed. It is that no point inside it was chosen at all, and the chart draws
        a run that never went off setpoint.
      </P>
    </Section>

    <Section id="algorithm" title="What the algorithm keeps">
      <P>
        Largest triangle three buckets divides the series into as many buckets as you asked for points,
        then keeps whichever point in a bucket makes the widest triangle with the point already kept
        and the centre of mass of the bucket ahead. Width of a triangle is a stand in for how much the
        line turns, so the points it keeps are the ones carrying the shape.
      </P>
      <P>
        Run over every whole target from 200 points to 2000, which is 1801 runs: 1715 of them keep 34.03
        exactly. 86 do not, and the worst of those reports 32.39. A bucket boundary can fall inside the
        peak, and then the peak competes with its own shoulder and can lose.
      </P>
      <Note>
        So do not write that the extremes survive. If a maximum must never move, the answer is a
        minimum and a maximum per bucket, which is a different algorithm and twice the points.
      </Note>
    </Section>

    <Section id="cost" title="What the cut is worth">
      <P>
        The path data for 50,400 points is 733,477 characters. Downsampled to 1000 it is 14,632, which
        is 50.1 times smaller. Click to the frame that carries the new path, five rounds each way on the
        built site: a median of 142.3ms with every reading, and 8.4ms downsampled, and the second figure
        includes the cut itself. 8.4ms is one frame on this display.
      </P>
      <P>
        The draw is the only thing that gets cheaper, and I expected the pointer to as well. A crosshair
        sweep of thirty pointer moves reads 8.3ms median at both sizes, with a worst frame of 8.9ms
        downsampled and 8.4ms with every reading. Plot's nearest point search over 50,400 points costs
        nothing I can measure. The reason to cut is the path and not the interaction.
      </P>
    </Section>

    <Section id="correction" title="Two numbers from the first pass">
      <P>
        The chart page published 146.9ms against 16.8ms for the same pair of draws. The slow figure holds
        at 142.3ms. The fast one does not, because 16.8ms was two frames on a 60Hz panel and 8.4ms is one
        frame on a 120Hz one. The measurement was of the display as much as of the code.
      </P>
      <P>
        It also published 172 of 181 targets keeping the peak, with the worst at 32.8. That sample was
        every tenth target, and it reproduces exactly. Sweeping all 1801 whole targets is where the
        worse case, 32.39, shows up. A sparser sample is not wrong, it just cannot find the tail.
      </P>
    </Section>

    <Section id="shape" title="Where it lives">
      <P>
        It is a function the caller runs, not a prop the chart takes, at{' '}
        <Code>@/components/ui/chart/downsample</Code>. The chart cannot know which of your marks is a
        line or which field carries the value, so passing it a target would mean telling it both, which
        is the same work with more surface.
      </P>
    </Section>

    <Section id="numbers" title="Measured">
      <Measured
        rows={[
          {
            value: '1715 of 1801',
            what: 'Targets that keep the peak of 34.03 exactly',
            detail:
              'Every whole target from 200 to 2000 over the 50,400 reading fixture. The 86 that lose it report as low as 32.39, because a bucket boundary can split the peak.',
          },
          {
            value: '30.08',
            what: 'What a stride of every fiftieth reading reports at the peak',
            detail:
              '1008 points kept, and the forty second excursion to 34.03 is not among them. This is the argument for the algorithm over a stride.',
          },
          {
            value: '733,477',
            what: 'Characters of path data for 50,400 points',
            detail:
              '14,632 downsampled to 1000, which is 50.1 times smaller. The same shape at 1000 points is what a reader can resolve anyway.',
          },
          {
            value: '142.3ms',
            what: 'Click to the painted frame with every reading',
            detail:
              'Median of five rounds, 132.6ms to 144.2ms. Downsampled it is 8.4ms including the cut, which is one frame here. The earlier 16.8ms was two frames at 60Hz.',
          },
          {
            value: '8.3ms',
            what: 'A crosshair sweep at either size',
            detail:
              'Thirty pointer moves, median frame, worst 8.9ms downsampled and 8.4ms with every reading. The nearest point search over 50,400 points costs nothing measurable.',
          },
        ]}
      />
    </Section>

    <Section id="drive" title="Drive it">
      <P>
        The toggle between the two sizes is on the{' '}
        <a className="text-indigo underline underline-offset-2" href="/components/chart">chart page</a>.
      </P>
    </Section>
  </article>
)
