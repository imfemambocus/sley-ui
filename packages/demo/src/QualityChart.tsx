import * as Plot from '@observablehq/plot'
import { useMemo } from 'react'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { quality, Q30_THRESHOLD } from './quality'

const SERIES = ['WGS', 'Exome', 'Methyl']
const PICKS = ['var(--color-pick-1)', 'var(--color-pick-2)', 'var(--color-pick-3)']

const Legend = () => (
  <ul className="flex items-center gap-(--stack)">
    {SERIES.map((assay, index) => (
      <li key={assay} className="flex items-center gap-1.5">
        <span className="size-[5px] shrink-0 rounded-full" style={{ backgroundColor: PICKS[index] }} />
        <span className="text-weft-dim">{assay}</span>
      </li>
    ))}
  </ul>
)

export const QualityChart = () => {
  const options = useMemo<ChartOptions>(
    () => ({
      x: { type: 'utc', label: null },
      y: { label: null, domain: [70, 100], grid: true },
      color: { domain: SERIES, range: PICKS },
      marks: [
        Plot.ruleY([Q30_THRESHOLD], { stroke: 'var(--color-madder)', strokeDasharray: '3 3' }),
        Plot.text([Q30_THRESHOLD], {
          y: (value: number) => value,
          frameAnchor: 'right',
          text: () => `floor ${Q30_THRESHOLD}`,
          fill: 'var(--color-madder)',
          textAnchor: 'end',
          dy: -7,
          dx: -2,
        }),
        /* daily readings, so the line joins them straight. a curve would draw a value nobody measured. */
        Plot.lineY(quality, { x: 'day', y: 'q30', stroke: 'assay', strokeWidth: 1.5 }),
        Plot.crosshairX(quality, { x: 'day', y: 'q30' }),
      ],
    }),
    [],
  )

  return <Chart title="Q30 by assay" unit="%" actions={<Legend />} options={options} />
}
