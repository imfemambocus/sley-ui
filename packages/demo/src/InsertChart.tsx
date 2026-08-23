import * as Plot from '@observablehq/plot'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { DIMER, inserts, SPAN } from './inserts'

export type BaseRange = readonly [number, number]

interface InsertChartProps {
  readonly range: BaseRange | null
  readonly onRangeChange: (range: BaseRange | null) => void
}

/* the bin width, stated rather than derived, so the bars mean the same thing at every width */
const BIN = 10

/* a fragment is a whole number of bases, and a window landing inside one covers it */
function snapToBases(range: BaseRange): BaseRange {
  return [Math.floor(range[0]), Math.ceil(range[1])]
}

export const InsertChart = ({ range, onRangeChange }: InsertChartProps) => {
  const options = useMemo<ChartOptions>(
    () => ({
      x: { label: null, domain: SPAN },
      y: { label: null, grid: true },
      marks: [
        Plot.rectY(
          inserts(),
          Plot.binX<Plot.RectYOptions>({ y: 'count' }, { x: Plot.identity, interval: BIN, fill: 'var(--color-pick-1)' }),
        ),
        Plot.ruleX([DIMER.centre], { stroke: 'var(--color-madder)', strokeDasharray: '3 3' }),
        Plot.text([DIMER.centre], {
          x: (value: number) => value,
          frameAnchor: 'top',
          text: () => `dimer ${DIMER.centre}`,
          fill: 'var(--color-madder)',
          textAnchor: 'end',
          dx: -10,
          dy: 2,
        }),
      ],
    }),
    [],
  )

  return (
    <Chart<number>
      title="Fragment length"
      unit="bp"
      options={options}
      height={220}
      brush={range}
      onBrush={(next) => onRangeChange(next && snapToBases(next))}
      actions={
        range && (
          <Button onClick={() => onRangeChange(null)}>
            {/* two faces on one line, so they share a baseline instead of a box centre */}
            <span className="inline-flex items-baseline gap-1.5">
              <span className="font-data">
                {range[0]} to {range[1]}
              </span>
              <span className="text-weft-faint">clear</span>
            </span>
          </Button>
        )
      }
    />
  )
}
