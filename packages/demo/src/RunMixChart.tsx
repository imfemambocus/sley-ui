import * as Plot from '@observablehq/plot'
import { useMemo } from 'react'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { runs, STATUSES } from './runs'

/* a status keeps the dye it already has in the table, so the two read as one screen */
const DYES: Record<string, string> = {
  complete: 'var(--color-jade)',
  running: 'var(--color-indigo)',
  queued: 'var(--color-weft-faint)',
  failed: 'var(--color-madder)',
}

const StatusKey = () => (
  <ul className="flex items-baseline gap-(--stack)">
    {STATUSES.map((status) => (
      <li key={status} className="flex items-baseline gap-1.5">
        <span
          className="size-1.25 shrink-0 translate-y-[-2px] rounded-full"
          style={{ backgroundColor: DYES[status] }}
        />
        <span className="text-weft-dim">{status}</span>
      </li>
    ))}
  </ul>
)

export const RunMixChart = () => {
  const options = useMemo<ChartOptions>(
    () => ({
      x: { label: null },
      y: { label: null, grid: true, interval: 1 },
      color: { domain: STATUSES, range: STATUSES.map((status) => DYES[status]) },
      marks: [
        Plot.barY(
          runs,
          Plot.groupX({ y: 'count' }, { x: 'assay', fill: 'status', sort: { x: 'y', reverse: true } }),
        ),
      ],
    }),
    [],
  )

  return <Chart title="Runs by assay" unit="count" options={options} height={220} actions={<StatusKey />} />
}
