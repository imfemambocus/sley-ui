import * as Plot from '@observablehq/plot'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { crosshairX } from '@/components/ui/chart/crosshair'
import { downsample } from '@/components/ui/chart/downsample'
import { clockLabel, READINGS, trace } from './trace'

/* a thousand points across a frame of about a thousand pixels, so one point a column */
const TARGET = 1000

const count = (value: number) => value.toLocaleString('en-GB')

export const TraceChart = () => {
  const [full, setFull] = useState(false)

  const points = useMemo(
    () => (full ? trace() : downsample(trace(), (sample) => sample.at.getTime(), (sample) => sample.celsius, TARGET)),
    [full],
  )

  const options = useMemo<ChartOptions>(
    () => ({
      x: { type: 'utc', label: null },
      y: { label: null, domain: [20, 35], grid: true },
      marks: [
        Plot.lineY(points, { x: 'at', y: 'celsius', stroke: 'var(--color-pick-1)', strokeWidth: 1.5 }),
        crosshairX(points, { x: 'at', y: 'celsius', formatX: (sample) => clockLabel(sample.at) }),
      ],
    }),
    [points],
  )

  return (
    <Chart
      title="Flow cell temperature"
      unit="°C"
      options={options}
      actions={
        <Button onClick={() => setFull((current) => !current)}>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="font-data">{count(points.length)}</span>
            <span className="text-weft-faint">{full ? 'every reading' : `of ${count(READINGS)}`}</span>
          </span>
        </Button>
      }
    />
  )
}
