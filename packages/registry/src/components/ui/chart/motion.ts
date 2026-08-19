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
