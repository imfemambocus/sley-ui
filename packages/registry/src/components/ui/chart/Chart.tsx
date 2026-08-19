import * as Plot from '@observablehq/plot'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '@/lib/cx'

/* the stylesheet reaches the generated svg through this one name */
const PLOT_CLASS = 'sley-plot'

/*
 * plot takes a margin as a number, so it cannot read a density token. these are
 * sized for the widest tick label at the comfortable text size, which leaves a
 * denser mode a little slack and spares every chart a re-render on the knob.
 */
const MARGIN = { marginTop: 16, marginRight: 16, marginBottom: 40, marginLeft: 56 }

/* plot points a quantitative axis label with an arrow glyph, and no interface string here carries one */
const AXIS = { labelArrow: 'none' } as const

export type ChartOptions = Omit<Plot.PlotOptions, 'width' | 'height' | 'className'>

export interface ChartProps {
  readonly title: string
  /* the unit belongs in the header, the way a column head carries it and a cell never does */
  readonly unit?: string
  /* hold this stable, or every parent render tears the plot down and builds it again */
  readonly options: ChartOptions
  readonly height?: number
  readonly actions?: ReactNode
  readonly className?: string
}

export function Chart({ title, unit, options, height = 260, actions, className }: ChartProps) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = host.current
    if (!node) return undefined

    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const node = host.current
    if (!node || width === 0) return undefined

    const plot = Plot.plot({
      ...MARGIN,
      ariaLabel: title,
      ...options,
      x: { ...AXIS, ...options.x },
      y: { ...AXIS, ...options.y },
      width,
      height,
      className: PLOT_CLASS,
    })
    node.append(plot)
    return () => plot.remove()
  }, [title, options, width, height])

  return (
    <section className={cx('@container border border-reed bg-raised', className)}>
      <header className="flex items-center justify-between gap-(--stack) border-b border-reed px-(--cell-x) py-(--stack)">
        <h2 className="inline-flex items-baseline gap-1.5 font-medium">
          <span>{title}</span>
          {unit && <span className="font-data font-normal text-weft-faint">{unit}</span>}
        </h2>
        {actions && <div className="flex items-center gap-(--stack)">{actions}</div>}
      </header>

      <div ref={host} className="px-(--cell-x) py-(--stack)" />
    </section>
  )
}
