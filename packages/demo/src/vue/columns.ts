import type { Column } from '@/components/ui/table/Table.vue'
import { STATUSES, type Run } from '../runs'

export const Q30_FLOOR = 80

/* the cells themselves come from the `cell-<key>` slots of whoever draws the table */
export const RUN_COLUMNS: readonly Column<Run>[] = [
  { key: 'id', label: 'Run', chars: 6, sortValue: (r) => r.id },
  { key: 'sample', label: 'Sample', chars: 10, sortValue: (r) => r.sample },
  { key: 'assay', label: 'Assay', chars: 8, sortValue: (r) => r.assay },
  { key: 'status', label: 'Status', chars: 10, sortValue: (r) => STATUSES.indexOf(r.status) },
  {
    key: 'reads',
    label: 'Reads',
    unit: 'M',
    hint: 'Millions of reads that passed the chastity filter.',
    chars: 5,
    numeric: true,
    sortValue: (r) => r.reads,
  },
  {
    key: 'q30',
    label: 'Q30',
    unit: '%',
    hint: `The share of bases called with a quality of 30 or better. A run under ${Q30_FLOOR}% carries the mark.`,
    chars: 4,
    numeric: true,
    sortValue: (r) => r.q30,
  },
  {
    key: 'coverage',
    label: 'Coverage',
    unit: 'x',
    hint: 'The mean depth across the target region.',
    chars: 5,
    numeric: true,
    sortValue: (r) => r.coverage,
  },
  /* a machine value takes the data face; a human name keeps the interface face */
  { key: 'started', label: 'Started', chars: 12, sortValue: (r) => r.started },
  { key: 'duration', label: 'Duration', chars: 6, numeric: true, sortValue: (r) => r.duration },
  { key: 'owner', label: 'Owner', chars: 11, sortValue: (r) => r.owner },
]
