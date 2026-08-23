import { Figure } from '@/components/ui/figure/Figure'
import { Sparkline } from '@/components/ui/sparkline/Sparkline'
import { Table, type Column } from '@/components/ui/table/Table'
import { quality } from '@demo/quality'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

interface Series {
  readonly assay: string
  readonly q30: readonly number[]
}

const SERIES: readonly Series[] = ['WGS', 'Exome', 'Methyl'].map((assay) => ({
  assay,
  q30: quality.filter((reading) => reading.assay === assay).map((reading) => reading.q30),
}))

/* the y domain of the chart on the chart page, so a row here and a line there agree */
const DOMAIN: readonly [number, number] = [70, 100]

const last = (values: readonly number[]) => values[values.length - 1]

const COLUMNS: readonly Column<Series>[] = [
  {
    key: 'assay',
    label: 'Assay',
    chars: 8,
    sortValue: (row) => row.assay,
    render: (row) => row.assay,
  },
  {
    key: 'q30',
    label: 'Q30, 30 days',
    chars: 18,
    render: (row) => (
      <Sparkline
        values={row.q30}
        domain={DOMAIN}
        label={`${row.assay} ran from ${Math.min(...row.q30)} to ${Math.max(...row.q30)} over thirty days`}
        className="text-indigo"
      />
    ),
  },
  {
    key: 'latest',
    label: 'Latest',
    unit: '%',
    chars: 6,
    numeric: true,
    sortValue: (row) => last(row.q30),
    render: (row) => <Figure value={last(row.q30)} low={last(row.q30) < 80} />,
  },
]

const SparklineDemo = () => (
  <Demo
    bleed
    caption="Thirty days of Q30 for each assay, one row each. All three share a domain, so the rows can be read against one another rather than each against itself."
  >
    <Table
      rows={SERIES}
      columns={COLUMNS}
      rowId={(row) => row.assay}
      title="Assays"
      noun={['assay', 'assays']}
    />
  </Demo>
)

const Notes = () => (
  <>
    <P>
      A trend belongs in the row it describes. Moving your eye to a chart above the table and back
      again loses the row you were on, and a table of thirty numbers is not a shape anybody reads.
    </P>
    <P>
      This is not the chart component with its frame taken off. Plot costs 90.55kB gzipped and a mark
      the height of one line of a table cell cannot be worth that. A sparkline is one path through a
      list of numbers. It draws its own, and the whole item ships with no dependency at all.
    </P>
    <P>
      The height is <Code>1.5em</Code>. That resolves against the text of the cell it sits in, which
      means it follows the density knob. The mark tightens with the row instead of holding its own
      size while everything around it closes up.
    </P>
    <P>
      The path is built in a fixed box and the svg is stretched to whatever the column is worth. That
      much is ordinary. The stroke is not. A non-uniform scale draws it thicker across than down, and
      the line then comes out heavier in a wide column than a narrow one.{' '}
      <Code>vector-effect: non-scaling-stroke</Code> takes the stroke out of that transform and it
      stays 1.5px whatever the column does.
    </P>
    <P>
      Pass a <Code>domain</Code> and a column of them stands on one scale. Leave it off and each row
      is scaled to its own extent. That is the right reading for a row sharing nothing with the rows
      around it, and the wrong one for a column of the same measurement.
    </P>
    <P>
      The svg is hidden from the accessibility tree and the reading goes beside it in text. A shape
      reaches no screen reader. The low value in the table already follows that rule, drawing the
      reed under its digits and carrying the words as well.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'sparkline',
  name: 'Sparkline',
  summary: 'A trend line at row height, drawn without a chart library, for a series inside a table cell.',
  exports: ['Sparkline'],
  Demo: SparklineDemo,
  api: [
    { name: 'values', type: 'readonly number[]', required: true, detail: 'The series, in order. Fewer than two readings draw nothing.' },
    {
      name: 'label',
      type: 'string',
      required: true,
      detail: 'What the shape says, in words. The svg is hidden from the accessibility tree and this is read instead.',
    },
    {
      name: 'domain',
      type: 'readonly [number, number]',
      detail: 'The scale to draw against. Leave it off and the series is scaled to its own extent.',
    },
    { name: 'className', type: 'string', detail: 'Merged last. The line is drawn in currentColor, so a text colour dyes it.' },
  ],
  measured: [
    {
      value: '21 / 19.5 / 18px',
      what: 'The mark at comfortable, compact and dense',
      detail:
        'The cell text is 14px, 13px and 12px at the three densities and the height is 1.5em of it, so the three readings are exactly 1.5 times the three sizes. The row is 40px, 32px and 25px over the same range, and the column narrows from 155.4px to 144.3px to 133.2px, because the character count that sizes it reads the density too.',
    },
    {
      value: '2.331px / 1.502px',
      what: 'One stroke without the vector effect and with it',
      detail:
        'The path is built in a 100 by 24 box and the svg renders 155.4 by 21, which is a scale of 1.554 across and 0.875 down. Read off a screenshot at device pixel ratio 2: a plain stroke covers 2.331px through a vertical segment and 1.314px through a horizontal one, matching 1.5 times each scale. With non-scaling-stroke the same two readings are 1.449px and 1.502px.',
    },
  ],
  Notes,
}
