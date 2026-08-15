import { Elapsed, Figure } from '@/components/ui/figure/Figure'
import type { Column } from '@/components/ui/table/Table'
import { STATUSES, type Run } from '../data/runs'
import { stamp } from './format'
import { STATUS_TONE } from './status'

export const Q30_FLOOR = 80

export function runColumns(onOpen: (run: Run) => void): readonly Column<Run>[] {
  return [
    {
      key: 'id',
      label: 'Run',
      chars: 6,
      sortValue: (r) => r.id,
      render: (r) => (
        <button
          type="button"
          onClick={() => onOpen(r)}
          className="cursor-pointer font-data text-weft transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-indigo"
        >
          {r.id}
        </button>
      ),
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
      render: (r) => <span className="font-data">{r.assay}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      chars: 10,
      sortValue: (r) => STATUSES.indexOf(r.status),
      render: (r) => (
        <span className={`inline-flex items-center gap-1.5 ${STATUS_TONE[r.status]}`}>
          <span className={`size-1.25 rounded-full bg-current ${r.status === 'running' ? 'beat' : ''}`} />
          <span className="font-data">{r.status}</span>
        </span>
      ),
    },
    {
      key: 'reads',
      label: 'Reads',
      unit: 'M',
      hint: 'Millions of reads that passed the chastity filter.',
      chars: 5,
      numeric: true,
      sortValue: (r) => r.reads,
      render: (r) => <Figure value={r.reads} />,
    },
    {
      key: 'q30',
      label: 'Q30',
      unit: '%',
      hint: `The share of bases called with a quality of 30 or better. A run under ${Q30_FLOOR}% carries the mark.`,
      chars: 4,
      numeric: true,
      sortValue: (r) => r.q30,
      render: (r) => <Figure value={r.q30} low={r.q30 > 0 && r.q30 < Q30_FLOOR} />,
    },
    {
      key: 'coverage',
      label: 'Coverage',
      unit: 'x',
      hint: 'The mean depth across the target region.',
      chars: 5,
      numeric: true,
      sortValue: (r) => r.coverage,
      render: (r) => <Figure value={r.coverage} />,
    },
    /* a machine value takes the data face, and a human name keeps the interface face */
    {
      key: 'started',
      label: 'Started',
      chars: 12,
      sortValue: (r) => r.started,
      render: (r) => <span className="font-data">{stamp(r.started).short}</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      chars: 6,
      numeric: true,
      sortValue: (r) => r.duration,
      render: (r) => <Elapsed minutes={r.duration} />,
    },
    {
      key: 'owner',
      label: 'Owner',
      chars: 11,
      sortValue: (r) => r.owner,
      render: (r) => r.owner,
    },
  ]
}
