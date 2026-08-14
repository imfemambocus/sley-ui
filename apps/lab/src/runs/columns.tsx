import { Elapsed, Figure } from '@/components/ui/figure/Figure'
import type { Column } from '@/components/ui/table/Table'
import { STATUSES, type Run, type RunStatus } from '../data/runs'

const STATUS_TONE: Record<RunStatus, string> = {
  complete: 'text-jade',
  running: 'text-indigo',
  queued: 'text-weft-faint',
  failed: 'text-madder',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function stamp(iso: string) {
  const [date, time] = iso.split('T')
  const [, month, day] = date.split('-')
  return `${day} ${MONTHS[Number(month) - 1]} ${time}`
}

/*
 * a column that drops keeps its class literal here, because the tailwind scanner
 * reads the source and never the computed value. the width in the query is the
 * container's, not the viewport's.
 */
const DROP = {
  first: '@max-[1000px]:hidden',
  second: '@max-[860px]:hidden',
  third: '@max-[720px]:hidden',
} as const

const Q30_FLOOR = 80

export const RUN_COLUMNS: readonly Column<Run>[] = [
  {
    key: 'id',
    label: 'Run',
    chars: 6,
    sortValue: (r) => r.id,
    render: (r) => <span className="font-data text-weft">{r.id}</span>,
  },
  {
    key: 'sample',
    label: 'Sample',
    chars: 10,
    sortValue: (r) => r.sample,
    render: (r) => (
      <span className="font-data" title={r.sample}>
        {r.sample}
      </span>
    ),
  },
  {
    key: 'assay',
    label: 'Assay',
    chars: 8,
    sortValue: (r) => r.assay,
    drop: DROP.third,
    render: (r) => <span className="font-data">{r.assay}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    chars: 10,
    sortValue: (r) => STATUSES.indexOf(r.status),
    render: (r) => (
      <span className={`inline-flex items-center gap-1.5 @max-[780px]:gap-0 ${STATUS_TONE[r.status]}`}>
        <span className={`size-1.25 rounded-full bg-current ${r.status === 'running' ? 'beat' : ''}`} />
        <span className="font-data @max-[780px]:sr-only">{r.status}</span>
      </span>
    ),
  },
  {
    key: 'reads',
    label: 'Reads',
    unit: 'M',
    chars: 5,
    numeric: true,
    sortValue: (r) => r.reads,
    render: (r) => <Figure value={r.reads} />,
  },
  {
    key: 'q30',
    label: 'Q30',
    unit: '%',
    chars: 4,
    numeric: true,
    sortValue: (r) => r.q30,
    render: (r) => <Figure value={r.q30} low={r.q30 > 0 && r.q30 < Q30_FLOOR} />,
  },
  {
    key: 'coverage',
    label: 'Coverage',
    unit: 'x',
    chars: 5,
    numeric: true,
    sortValue: (r) => r.coverage,
    drop: DROP.third,
    render: (r) => <Figure value={r.coverage} />,
  },
  /* a machine value takes the data face, and a human name keeps the interface face */
  {
    key: 'started',
    label: 'Started',
    chars: 12,
    drop: DROP.first,
    sortValue: (r) => r.started,
    render: (r) => <span className="font-data">{stamp(r.started)}</span>,
  },
  {
    key: 'duration',
    label: 'Duration',
    chars: 6,
    numeric: true,
    drop: DROP.second,
    sortValue: (r) => r.duration,
    render: (r) => <Elapsed minutes={r.duration} />,
  },
  {
    key: 'owner',
    label: 'Owner',
    chars: 11,
    drop: DROP.second,
    sortValue: (r) => r.owner,
    render: (r) => r.owner,
  },
]
