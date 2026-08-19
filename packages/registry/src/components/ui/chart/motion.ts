/*
 * a dash cannot be given the length of its own path from a stylesheet, so the length
 * is measured here and handed to the animation as a custom property.
 */
export function drawLines(svg: SVGSVGElement) {
  const paths = svg.querySelectorAll<SVGPathElement>('g[aria-label="line"] path')

  paths.forEach((path, index) => {
    path.style.setProperty('--draw', `${path.getTotalLength()}px`)
    path.style.setProperty('--draw-delay', `calc(var(--dur-instant) * ${index})`)
    path.classList.add('reed-draw')
  })

  return paths.length
}

/*
 * a bar grows out of the axis rather than out of its own box, so a stacked column stays
 * whole on the way up. every rect scales about the same baseline, which is the lowest
 * edge any of them reaches.
 */
export function drawBars(svg: SVGSVGElement) {
  const rects = [...svg.querySelectorAll<SVGRectElement>('g[aria-label="bar"] rect')]
  if (rects.length === 0) return 0

  const base = Math.max(...rects.map((rect) => rect.y.baseVal.value + rect.height.baseVal.value))
  const columns = [...new Set(rects.map((rect) => rect.x.baseVal.value))].sort((left, right) => left - right)
  const order = new Map(columns.map((x, index) => [x, index]))

  for (const rect of rects) {
    const index = order.get(rect.x.baseVal.value) ?? 0
    rect.style.setProperty('--build-base', `${base}px`)
    /* the sweep across the columns fits inside one --dur-instant, whatever the count */
    rect.style.setProperty('--build-delay', `calc(var(--dur-instant) * ${index / columns.length})`)
    rect.classList.add('reed-build')
  }

  return rects.length
}
