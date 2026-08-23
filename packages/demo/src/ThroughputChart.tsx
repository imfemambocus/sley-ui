import * as Plot from '@observablehq/plot'
import { useMemo } from 'react'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { SPAN } from './quality'
import { throughput } from './throughput'

/* an assay keeps the pick the quality chart gives it, so the two read as one screen */
const SERIES = ['WGS', 'Exome', 'Methyl']
const PICKS = ['var(--color-pick-1)', 'var(--color-pick-2)', 'var(--color-pick-3)']

const AssayKey = () => (
  <ul className="flex items-baseline gap-(--stack)">
    {SERIES.map((assay, index) => (
      <li key={assay} className="flex items-baseline gap-1.5">
        <span
          className="size-1.25 shrink-0 translate-y-[-2px] rounded-full"
          style={{ backgroundColor: PICKS[index] }}
        />
        <span className="text-weft-dim">{assay}</span>
      </li>
    ))}
  </ul>
)

export const ThroughputChart = () => {
  const options = useMemo<ChartOptions>(
    () => ({
      x: { type: 'utc', label: null, domain: SPAN },
      y: { label: null, grid: true },
      color: { domain: SERIES, range: PICKS },
      marks: [Plot.areaY(throughput, { x: 'day', y: 'gb', fill: 'assay' })],
    }),
    [],
  )

  return <Chart title="Daily output" unit="Gb" options={options} height={220} actions={<AssayKey />} />
}
