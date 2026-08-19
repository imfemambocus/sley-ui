import * as Plot from '@observablehq/plot'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import { Chart, type ChartOptions } from '@/components/ui/chart/Chart'
import { crosshairX } from '@/components/ui/chart/crosshair'
import { dayLabel, quality, SPAN } from './quality'

const STATES = ['loading', 'empty', 'data'] as const
type State = (typeof STATES)[number]

export const ChartStates = () => {
  const [state, setState] = useState<State>('loading')

  const options = useMemo<ChartOptions>(
    () => ({
      x: { type: 'utc', label: null, domain: SPAN },
      y: { label: null, domain: [70, 100], grid: true },
      marks: [
        Plot.lineY(quality, { x: 'day', y: 'q30', stroke: 'assay', strokeWidth: 1.5 }),
        crosshairX(quality, { x: 'day', y: 'q30', formatX: (reading) => dayLabel(reading.day) }),
      ],
    }),
    [],
  )

  return (
    <Chart
      title="Q30 by assay"
      unit="%"
      options={options}
      height={220}
      loading={state === 'loading'}
      empty={state === 'empty'}
      emptyMessage="No reading in this range."
      actions={STATES.map((name) => (
        <Button key={name} aria-pressed={state === name} onClick={() => setState(name)}>
          <span className={state === name ? undefined : 'text-weft-faint'}>{name}</span>
        </Button>
      ))}
    />
  )
}
