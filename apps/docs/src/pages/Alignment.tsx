import { Measured } from '../site/Measured'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

export const Alignment = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Aligning a control to a line of type</PageTitle>
      <Lede>
        A checkbox beside a value, a sort mark beside a column head, two type faces on one row. Every
        one of those looked wrong to me at some point, and every time I reasoned about it I got a
        different answer from the one the browser gave. These are the numbers, and the method that
        produced them.
      </Lede>
    </header>

    <Section id="boxes" title="The boxes agree and the letters do not">
      <P>
        Put a word in the interface face next to a value in the data face, give the row{' '}
        <Code>items-center</Code>, and the two boxes are centred to the pixel. The letters are not,
        because the faces carry different line heights and a centred box says nothing about where the
        baseline inside it lands.
      </P>
      <P>
        Measured on this site's own faces, Archivo beside IBM Plex Mono: the baselines are 0.5px apart
        at 12px, 13px and 14px, and 1px apart at 16px and 20px. Move the row to{' '}
        <Code>items-baseline</Code> and it is 0.000px at all five sizes. Half a pixel is not a bug
        report. It is the reason a table of values looks slightly unsettled and nobody can say why.
      </P>
    </Section>

    <Section id="probe" title="How to measure a baseline, since this all turns on it">
      <P>
        Put an empty <Code>inline-block</Code> inside the span and read its bottom edge. An empty
        inline box takes its baseline from its own bottom, and two of them compare exactly. A range
        rect gives you the ink instead, which rounds, and which a descender moves.
      </P>
      <P>
        The other way is to derive the baseline from the line box and the font's own ascent and
        descent, which sounds equivalent and is not. On the checkbox page it disagreed with the probe
        by 0.25px at compact density, reporting 0.459px where the probe read 0.209px. When the whole
        question is worth half a pixel, a method that costs you a quarter of one is not a method.
      </P>
      <Note>
        Probe the span that holds the text, not its parent. A parent with{' '}
        <Code>display: inline-flex</Code> has a baseline of its own, and probing that reported 6px of
        drift in the site header where the answer is 0.
      </Note>
    </Section>

    <Section id="band" title="A control centres on the cap band, not the box">
      <P>
        <Code>vertical-align: middle</Code> centres a control on the x-height. In a table of ids,
        counts and timestamps there are no lowercase letters to speak of. The band a reader sees
        runs from the baseline to the cap height, and a box centred on the x-height sits low.
      </P>
      <P>
        The fix is one token. <Code>--ctl-lift</Code> is 0.091em, half the difference for the data
        face, and it comes out as 1.274px, 1.183px and 1.092px at 14px, 13px and 12px. Without it the
        13px box on the checkbox page sits 1.576px, 1.392px and 1.208px below the cap band centre.
        With it, 0.302px, 0.209px and 0.116px. It deliberately depends on the metrics of the pair,
        which is a cost worth naming: change the faces and these numbers move.
      </P>
    </Section>

    <Section id="cell" title="Inside a table row, the cell decides instead">
      <P>
        The same control in a table row does not use any of that. The cell centres it, and the answer
        needs no font metrics at all, and the residue is what the browser leaves when a 13px box is
        centred in a row of 40px, 32px or 25px: 0.046px, 0.145px and 0.252px. It grows as the row
        tightens, and at a quarter of a pixel in dense mode I stopped.
      </P>
      <P>
        A form that rises off the baseline is a third case. The sort mark is a shape standing on the
        line rather than a box sitting across it, so it joins the label's baseline group instead of
        being centred, and its bottom edge lands on the label's baseline at 0.000px in all three
        densities. The shape decides the rule: a box centres on the cap band, a rising form stands on
        the baseline.
      </P>
    </Section>

    <Section id="header" title="The one my eye lost">
      <P>
        The site header puts a 19px wordmark next to 14px links. I argued twice that the lockup should
        be centred in the row, because the loom mark beside the word has no baseline of its own. It
        looked low both times, and it was: a reader sees a line of words, not a row of boxes, and two
        sizes cannot share a box centre and a baseline at once.
      </P>
      <P>
        It now sits 1.5px above the row centre, and the wordmark and all four items beside it share
        one baseline at 0.000px. The measurement did not decide that one. It only told me how far to
        move it once I accepted the answer.
      </P>
    </Section>

    <Section id="numbers" title="Measured">
      <Measured
        rows={[
          {
            value: '0.5px',
            what: 'Baseline drift between the two faces on one centred row',
            detail:
              'Archivo against IBM Plex Mono at 12px, 13px and 14px, rising to 1px at 16px and 20px. With items-baseline it is 0.000px at all five sizes.',
          },
          {
            value: '1.576px',
            what: 'How low a 13px control sits without the cap band lift',
            detail:
              'Beside a 14px label. 1.392px at 13px and 1.208px at 12px. The lift is 0.091em, which is 1.274px, 1.183px and 1.092px, and it leaves 0.302px, 0.209px and 0.116px.',
          },
          {
            value: '0.046px',
            what: 'The same control centred by a table cell instead',
            detail:
              'A 13px box in a 40px row. 0.145px in a 32px row and 0.252px in a 25px row, so the residue grows as the row tightens. No font metrics are involved.',
          },
          {
            value: '0.000px',
            what: 'The sort mark standing on its label baseline',
            detail:
              'In all three densities, with a 7px mark. A rising form takes the baseline where a box takes the cap band.',
          },
          {
            value: '1.5px',
            what: 'How far the 19px wordmark sits above the header row centre',
            detail:
              'It shares one baseline with the four 14px items beside it at 0.000px. Centring the boxes measured 0.000px too, and looked wrong.',
          },
        ]}
      />
    </Section>

    <Section id="why" title="Why any of this is in a component library">
      <P>
        Because the density scale means every one of these numbers has three values, and a component
        that is right at 40px rows and wrong at 25px is not finished. Reasoning gives you one answer
        for all three. You can drive the knob yourself on the{' '}
        <a className="text-indigo underline underline-offset-2" href="/docs/density">density page</a>.
      </P>
    </Section>
  </article>
)
