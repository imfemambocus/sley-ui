import * as Plot from '@observablehq/plot'

export interface CrosshairXOptions<T> {
  readonly x: Plot.ChannelValue
  readonly y?: Plot.ChannelValue
  readonly formatX?: (row: T) => string
  readonly formatY?: (row: T) => string
  readonly maxRadius?: number
}

const RULE = { inset: -6, stroke: 'currentColor', strokeOpacity: 0.2 } as const

/* the halo outlines each glyph against the surface the chart is drawn on */
const READOUT = { fill: 'currentColor', stroke: 'var(--plot-background)', strokeWidth: 5 } as const

/* plot names the group of rendered elements from a field the class type does not declare */
const named = <M extends object>(mark: M, ariaLabel: string) => Object.assign(mark, { ariaLabel })

/*
 * plot's own crosshair derives each readout from its source channel through an
 * initializer, and an initializer's channels are merged over the declared ones, so a
 * text the caller passes is discarded and a date reads as a full iso stamp. the pairs
 * are composed here from the same public pointer transform instead.
 */
export function crosshairX<T>(data: readonly T[], options: CrosshairXOptions<T>) {
  const { x, y, formatX, formatY, maxRadius } = options
  const point = { px: x, py: y, maxRadius }

  const acrossRule = named(Plot.ruleX(data, Plot.pointerX({ ...point, x, ...RULE })), 'crosshair rule')

  const acrossText = named(
    Plot.text(
      data,
      Plot.pointerX({ ...point, x, text: formatX ?? x, dy: 9, frameAnchor: 'bottom', lineAnchor: 'top', ...READOUT }),
    ),
    'crosshair text',
  )

  if (y === undefined) return Plot.marks(acrossRule, acrossText)

  const downRule = named(Plot.ruleY(data, Plot.pointerX({ ...point, y, ...RULE })), 'crosshair rule')

  const downText = named(
    Plot.text(
      data,
      Plot.pointerX({ ...point, y, text: formatY ?? y, dx: -9, frameAnchor: 'left', textAnchor: 'end', ...READOUT }),
    ),
    'crosshair text',
  )

  /* both rules go under both readouts, or the horizontal rule crosses the label at the foot */
  return Plot.marks(acrossRule, downRule, acrossText, downText)
}
