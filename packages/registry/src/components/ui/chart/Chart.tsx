import * as Plot from '@observablehq/plot'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { attachBrush } from '@/components/ui/chart/brush'
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

export interface ChartProps<X> {
  readonly title: string
  /* the unit belongs in the header, the way a column head carries it and a cell never does */
  readonly unit?: string
  /* hold this stable, or every parent render tears the plot down and builds it again */
  readonly options: ChartOptions
  readonly height?: number
  readonly actions?: ReactNode
  /*
   * drag across the plot to report a range of the x scale, and click once to clear it.
   * the pointer is the only way in, so pair it with a control the keyboard can reach.
   */
  readonly onBrush?: (range: readonly [X, X] | null) => void
  /* the window the chart paints. hold it in your own state, the way a table's selection works. */
  readonly brush?: readonly [X, X] | null
  readonly className?: string
}

export function Chart<X = Date>({
  title,
  unit,
  options,
  height = 260,
  actions,
  onBrush,
  brush = null,
  className,
}: ChartProps<X>) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  /* the plot outlives a change of handler, so the newest one is read at report time */
  const report = useRef(onBrush)
  report.current = onBrush

  const window = useRef<{ show: (range: readonly [X, X] | null) => void } | null>(null)

  /* the plot is built in an effect that does not watch the window, so the first paint reads it here */
  const brushed = useRef(brush)
  brushed.current = brush

  useEffect(() => {
    window.current?.show(brush)
  }, [brush])

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

    const margins = { ...MARGIN, ...options }
    const plot = Plot.plot({
      ...margins,
      ariaLabel: title,
      x: { ...AXIS, ...options.x },
      y: { ...AXIS, ...options.y },
      width,
      height,
      className: PLOT_CLASS,
    })
    node.append(plot)

    const svg = plot instanceof SVGSVGElement ? plot : plot.querySelector('svg')
    const scale = plot.scale('x')
    if (!svg || !scale?.invert) return () => plot.remove()

    /* plot types every scale value as any, so both readings are named here once */
    const toValue: (px: number) => X = scale.invert.bind(scale)
    const toPixel: (value: X) => number = scale.apply.bind(scale)

    const handle = attachBrush(
      svg,
      {
        left: margins.marginLeft,
        right: width - margins.marginRight,
        top: margins.marginTop,
        bottom: height - margins.marginBottom,
      },
      { toValue, toPixel },
      (range) => report.current?.(range),
    )
    handle.show(brushed.current)
    window.current = handle

    return () => {
      window.current = null
      handle.destroy()
      plot.remove()
    }
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
