import * as Plot from '@observablehq/plot'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { dayLabel, quality, Q30_THRESHOLD, snapToDays, SPAN } from './quality'

export type DayRange = readonly [Date, Date]

interface QualityChartProps {
  readonly range: DayRange | null
  readonly onRangeChange: (range: DayRange | null) => void
}

const SERIES = ['WGS', 'Exome', 'Methyl']
const PICKS = ['var(--color-pick-1)', 'var(--color-pick-2)', 'var(--color-pick-3)']

interface LegendProps {
  readonly hidden: readonly string[]
  readonly onToggle: (assay: string) => void
}

const Legend = ({ hidden, onToggle }: LegendProps) => (
  <ul className="flex items-baseline gap-(--stack)">
    {SERIES.map((assay, index) => {
      const off = hidden.includes(assay)
      return (
        <li key={assay} className="flex">
          <button
            type="button"
            aria-pressed={!off}
            onClick={() => onToggle(assay)}
            className="flex cursor-pointer items-baseline gap-1.5"
          >
            <span
              className="size-1.25 shrink-0 translate-y-[-2px] rounded-full transition-colors duration-(--dur-instant) ease-(--ease-beat)"
              style={{ backgroundColor: off ? 'var(--color-reed-lit)' : PICKS[index] }}
            />
            <span className={off ? 'text-weft-faint' : 'text-weft-dim'}>{assay}</span>
          </button>
        </li>
      )
    })}
  </ul>
)

export const QualityChart = ({ range, onRangeChange }: QualityChartProps) => {
  const [hidden, setHidden] = useState<readonly string[]>([])

  const shown = useMemo(() => quality.filter((reading) => !hidden.includes(reading.assay)), [hidden])

  const options = useMemo<ChartOptions>(
    () => ({
      /* the domain comes from the whole fixture, not from what is drawn, or hiding a line moves the axis */
      x: { type: 'utc', label: null, domain: SPAN },
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
        Plot.lineY(shown, { x: 'day', y: 'q30', stroke: 'assay', strokeWidth: 1.5 }),
        Plot.crosshairX(shown, { x: 'day', y: 'q30' }),
      ],
    }),
    [shown],
  )

  const toggle = (assay: string) =>
    setHidden((was) => (was.includes(assay) ? was.filter((name) => name !== assay) : [...was, assay]))

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
          <Legend hidden={hidden} onToggle={toggle} />
        </>
      }
    />
  )
}
