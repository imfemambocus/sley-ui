import { useMemo } from 'react'
import { Table } from '@/components/ui/table/Table'
import { runColumns } from '@demo/columns'
import { runs } from '@demo/runs'
import { CodeBlock } from '../site/CodeBlock'
import { Demo } from '../site/Demo'
import { Measured } from '../site/Measured'
import { Code, Lede, List, Note, P, PageTitle, Section } from '../site/Prose'
import { Segmented } from '../site/Segmented'
import { DENSITIES, useDensityValues, useSettings } from '../site/settings'

const TOKEN_NOTES: Record<string, string> = {
  'row-h': 'The height of a table row, and of a command in the palette.',
  'cell-x': 'Horizontal padding in a cell, and in every control.',
  'ui-text': 'The interface text size. The reading column on this site does not follow it.',
  'ctl-h': 'The height of a button, a select trigger, an input, a tab.',
  stack: 'The gap between stacked things in a form or a header.',
  'reed-pitch': 'The spacing of the ticks in the reed. A finer reed makes denser cloth.',
}

const Knobs = () => {
  const { density, setDensity } = useSettings()
  const values = useDensityValues(density)

  return (
    <div className="border border-reed bg-raised">
      <div className="reed-edge flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <p className="text-weft-dim">
          Every value below is read back off the root element, live.
        </p>
        <Segmented legend="Density" options={DENSITIES} value={density} onSelect={setDensity} />
      </div>
      <dl className="flex flex-col">
        {values.map((token) => (
          <div
            key={token.name}
            className="flex flex-col gap-1 border-t border-reed/60 px-4 py-3 first:border-t-0 sm:flex-row sm:items-baseline sm:gap-5"
          >
            <dt className="shrink-0 font-data text-weft-dim sm:w-32">{token.name}</dt>
            <dd className="flex flex-wrap items-baseline gap-3">
              <span className="tnum font-data text-[15px] text-indigo">{token.value}</span>
              <span className="text-weft-dim">{TOKEN_NOTES[token.name]}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const LiveTable = () => {
  const columns = useMemo(() => runColumns(() => {}), [])

  return (
    <Demo bleed caption="Change the density above and watch this whole table retune. Nothing here is per-component.">
      <Table
        rows={runs.slice(0, 6)}
        columns={columns}
        rowId={(run) => run.id}
        title="Sequencing runs"
        noun={['run', 'runs']}
      />
    </Demo>
  )
}

export const DensityPage = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Density</PageTitle>
      <Lede>
        One attribute on the root element, six numbers behind it, and every component reads them.
        This is the idea the rest of the system is built around.
      </Lede>
    </header>

    <Knobs />

    <Section id="how" title="How you set it">
      <CodeBlock code={`<html data-density="dense">`} />
      <P>
        That is the whole API. Set it on <Code>documentElement</Code> from a preference, a media
        query, a user setting, or leave it alone: compact is the default, because it is the mode a
        working application spends its day in.
      </P>
      <List>
        <li>
          <Code>comfortable</Code> is for a form, a settings page, a screen someone reads slowly.
        </li>
        <li>
          <Code>compact</Code> is the default, and the one to build against.
        </li>
        <li>
          <Code>dense</Code> is for the screen somebody stares at all day and wants more rows on.
        </li>
      </List>
    </Section>

    <LiveTable />

    <Section id="not-sizes" title="Density changes what is present, not only what size it is">
      <P>
        Scaling five numbers is the easy half. In dense mode the group headings in the command
        palette are gone, and a field hint drops to screen readers only. The application asked for
        less chrome, so it gets less chrome rather than smaller chrome.
      </P>
      <Note>
        Width is a different matter, and width hides nothing. Nobody chooses the size of their
        screen, so a narrow viewport gets every column and scrolls. The application chooses the
        density; the reader does not choose the width.
      </Note>
    </Section>

    <Section id="rules" title="Two rules that keep it honest">
      <P>
        A length that has to follow the density lives in a token, never in a Tailwind spacing step. A
        numeric step compiles to a <Code>calc</Code> on the spacing variable, so it is in rem and it
        follows the root font size. The density tokens are px. Mix the two and they drift apart the
        moment a reader changes their browser font size.
      </P>
      <P>
        A component defines none of its own. It reads <Code>--row-h</Code>, <Code>--ctl-h</Code>,{' '}
        <Code>--cell-x</Code> and the rest, and that is why one attribute can retune all of them at
        once without anything falling out of step.
      </P>
    </Section>

    <Section id="measured" title="Measured">
      <Measured
        rows={[
          {
            value: '25px',
            what: 'A table row in dense mode',
            detail: 'The same row is 40px in comfortable. Every control in it follows without being told.',
          },
          {
            value: '13px',
            what: 'A checkbox, in all three modes',
            detail: 'It is the one thing that does not scale. Below this a tick stops being legible.',
          },
          {
            value: '0.05px to 0.25px',
            what: 'How far a control sits off the row centre',
            detail: 'Across all three modes. The cell centres it, so the row decides rather than the font metrics.',
          },
        ]}
      />
    </Section>
  </article>
)
