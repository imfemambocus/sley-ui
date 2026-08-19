import * as Plot from '@observablehq/plot'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { dayLabel, quality, Q30_THRESHOLD, snapToDays } from './quality'

export type DayRange = readonly [Date, Date]

interface QualityChartProps {
  readonly range: DayRange | null
  readonly onRangeChange: (range: DayRange | null) => void
}

const SERIES = ['WGS', 'Exome', 'Methyl']
const PICKS = ['var(--color-pick-1)', 'var(--color-pick-2)', 'var(--color-pick-3)']

const Legend = () => (
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

export const QualityChart = ({ range, onRangeChange }: QualityChartProps) => {
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

  return (
    <Chart<Date>
      title="Q30 by assay"
      unit="%"
      options={options}
      brush={range}
      onBrush={(next) => onRangeChange(next && snapToDays(next))}
      actions={
        <>
          {range && (
            <Button onClick={() => onRangeChange(null)}>
              {/* two faces on one line, so they share a baseline instead of a box centre */}
              <span className="inline-flex items-baseline gap-1.5">
                <span className="font-data">
                  {dayLabel(range[0])} to {dayLabel(range[1])}
                </span>
                <span className="text-weft-faint">clear</span>
              </span>
            </Button>
          )}
          <Legend />
        </>
      }
    />
  )
}
