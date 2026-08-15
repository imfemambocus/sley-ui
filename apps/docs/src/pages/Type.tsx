import { Elapsed, Figure } from '@/components/ui/figure/Figure'
import { Demo } from '../site/Demo'
import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

const PairDemo = () => (
  <Demo className="w-full" caption="Archivo above, IBM Plex Mono below. The data face carries the personality.">
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-data text-[11px] tracking-[0.13em] text-weft-faint uppercase">
          Interface, Archivo
        </span>
        <span className="font-ui text-[26px] leading-tight font-semibold tracking-[-0.03em] text-weft">
          Sequencing runs
        </span>
        <span className="font-ui text-weft-dim">
          A label, a heading, a button, a person&apos;s name.
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-data text-[11px] tracking-[0.13em] text-weft-faint uppercase">
          Data, IBM Plex Mono
        </span>
        <span className="tnum font-data text-[26px] leading-tight text-weft">R-4821 412.8 94.2</span>
        <span className="font-data text-weft-dim">An id, a timestamp, a code, a status word.</span>
      </div>
    </div>
  </Demo>
)

const AlignDemo = () => (
  <Demo
    className="w-full max-w-md"
    caption="Machine values align down the column. The owner is a person, so it keeps the interface face."
  >
    <table className="tnum w-full text-left">
      <thead>
        <tr className="reed-edge">
          <th scope="col" className="pb-2 font-medium text-weft-dim">
            Run
          </th>
          <th scope="col" className="pb-2 text-right font-medium text-weft-dim">
            Reads <span className="font-data text-weft-faint">M</span>
          </th>
          <th scope="col" className="pb-2 text-right font-medium text-weft-dim">
            Elapsed
          </th>
          <th scope="col" className="pb-2 text-right font-medium text-weft-dim">
            Owner
          </th>
        </tr>
      </thead>
      <tbody className="text-weft">
        {[
          { id: 'R-4821', reads: 412.8, minutes: 401, owner: 'A. Reuter' },
          { id: 'R-4817', reads: 104.6, minutes: 192, owner: 'S. Weiler' },
          { id: 'R-4812', reads: 74.9, minutes: 161, owner: 'M. Haas' },
        ].map((row) => (
          <tr key={row.id}>
            <td className="py-1 font-data">{row.id}</td>
            <td className="py-1 text-right font-data">
              <Figure value={row.reads} />
            </td>
            <td className="py-1 text-right font-data">
              <Elapsed minutes={row.minutes} />
            </td>
            <td className="py-1 text-right">{row.owner}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Demo>
)

export const TypePage = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Type</PageTitle>
      <Lede>
        Archivo for the interface, IBM Plex Mono for the data. The characterful face is the one on
        the numbers, which is the wrong way round on purpose.
      </Lede>
    </header>

    <PairDemo />

    <Section id="inversion" title="The data face carries the personality">
      <P>
        The usual arrangement is a display face for headings and something neutral underneath. In a
        data tool that is backwards, because the numbers are the content and the headings are
        furniture. So the interface face is Archivo, which is clean and stays out of the way at 12px,
        and the character sits in IBM Plex Mono where the reader actually spends their attention.
      </P>
    </Section>

    <Section id="rule" title="A machine value takes the data face; a human name keeps the interface face">
      <P>
        A timestamp, an id, a code and a status word are machine values. They align down their column,
        they are compared against each other, and a monospaced face is what makes that possible. A
        person&apos;s name is not a machine value, and setting it in mono makes it look like a
        database key.
      </P>
      <AlignDemo />
    </Section>

    <Section id="alignment" title="Two faces on one line align on the baseline">
      <P>
        A flex row with <Code>items-center</Code> centres each box, and the two faces have different
        line heights, so two words next to each other drift apart by half a pixel at 14px and a full
        one by 20px. Wrap them in one baseline group and keep an icon as a separate centred item.
        That is why a column head with a unit puts the label and the unit in the same{' '}
        <Code>items-baseline</Code> span.
      </P>
      <Note>
        A control beside a row of values is a different case again. It aligns on the cap band rather
        than the box, because every value in a data column is digits and capitals, and{' '}
        <Code>vertical-align: middle</Code> centres on the x-height instead.
      </Note>
    </Section>

    <Section id="measured" title="Measured">
      <Measured
        rows={[
          {
            value: '0.5px to 1px',
            what: 'How far apart two faces sit when each box is centred',
            detail: 'Half a pixel at the three density text sizes, and a full one by 20px. Both words look wrong and neither is.',
          },
          {
            value: '0.000px',
            what: 'The same pair in one items-baseline group',
            detail: 'Exact at every size I measured, from 12px to 20px, with a zero-size inline-block reading the baseline.',
          },
          {
            value: '0.091em',
            what: 'The cap band lift for a control beside data',
            detail: 'Half the difference between the cap height and the x-height of the data face.',
          },
          {
            value: '0.62px to 1.2px',
            what: 'How low a control sat before that lift',
            detail: 'Afterwards every density is inside half a pixel, and two of them are within 0.01px.',
          },
          {
            value: '0.6em',
            what: 'The advance of the data face',
            detail: 'It is what turns a column character count into a width, so a column is declared in characters.',
          },
        ]}
      />
      <P>
        These came out of canvas <Code>measureText</Code> rather than reasoning. The cap height is the
        ascent of an <Code>H</Code> and the x-height is the ascent of an <Code>x</Code>, and the
        effect is about a pixel, which is smaller than the error in any argument I could make about
        it. If you change the type pair, these numbers move with it.
      </P>
    </Section>
  </article>
)
