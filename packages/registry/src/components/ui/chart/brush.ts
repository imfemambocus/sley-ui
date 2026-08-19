const SVG_NS = 'http://www.w3.org/2000/svg'

/* a click that travels less than this is a click, and a click clears the window */
const MIN_DRAG = 3

/* the resize grip moves 8px a press, and a step under that reads as nothing happening */
const MIN_STEP = 8

const KEYS = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'])

/* the field is the only surface that can announce the keys, so its name carries them */
const HOW = 'Move an edge with the arrow keys. Escape clears.'

export interface BrushFrame {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

/*
 * plot re-renders a whole svg on every change, so the brush layer is appended to the
 * node it belongs to and dies with it. the caller owns no listener and no cleanup
 * beyond the teardown returned here.
 */
export interface BrushScale<T> {
  readonly toValue: (px: number) => T
  readonly toPixel: (value: T) => number
}

/* one press is one tick of the x axis: a distance the scale already draws for the reader */
function stepOf(svg: SVGSVGElement, frame: BrushFrame) {
  const ticks = svg.querySelectorAll<SVGGraphicsElement>('[aria-label="x-axis tick"] path')
  const xs = Array.from(ticks, (tick) => tick.transform.baseVal.consolidate()?.matrix.e ?? 0).sort(
    (a, b) => a - b,
  )
  const gaps = xs.slice(1).map((x, index) => x - xs[index])
  if (gaps.length === 0) return (frame.right - frame.left) / 20

  gaps.sort((a, b) => a - b)
  return Math.max(MIN_STEP, gaps[Math.floor(gaps.length / 2)])
}

export function attachBrush<T>(
  svg: SVGSVGElement,
  frame: BrushFrame,
  scale: BrushScale<T>,
  report: (range: readonly [T, T] | null) => void,
) {
  const height = frame.bottom - frame.top
  const step = stepOf(svg, frame)
  const named = svg.getAttribute('aria-label')

  const field = document.createElementNS(SVG_NS, 'rect')
  field.setAttribute('class', 'reed-brush-field')
  field.setAttribute('x', String(frame.left))
  field.setAttribute('y', String(frame.top))
  field.setAttribute('width', String(frame.right - frame.left))
  field.setAttribute('height', String(height))
  field.setAttribute('tabindex', '0')
  field.setAttribute('aria-label', named ? `Select a range on ${named}. ${HOW}` : `Select a range. ${HOW}`)

  const selection = document.createElementNS(SVG_NS, 'rect')
  selection.setAttribute('class', 'reed-brush')
  selection.setAttribute('aria-hidden', 'true')
  selection.setAttribute('y', String(frame.top))
  selection.setAttribute('height', String(height))
  selection.setAttribute('width', '0')

  /* the window tints the data rather than hiding it, so it goes under every mark */
  svg.insertBefore(selection, svg.firstChild)
  svg.append(field)

  let anchor = 0
  let edge = 0
  let dragging = false
  let live = false

  const xOf = (event: PointerEvent) => clampX(event.clientX - svg.getBoundingClientRect().left)

  const clampX = (value: number) => Math.max(frame.left, Math.min(frame.right, value))

  const paint = (from: number, to: number) => {
    selection.setAttribute('x', String(Math.min(from, to)))
    selection.setAttribute('width', String(Math.abs(to - from)))
  }

  const clear = () => {
    live = false
    paint(0, 0)
  }

  const onDown = (event: PointerEvent) => {
    dragging = true
    anchor = xOf(event)
    edge = anchor
    paint(anchor, anchor)
    field.setPointerCapture(event.pointerId)
  }

  const onMove = (event: PointerEvent) => {
    if (!dragging) return
    edge = xOf(event)
    paint(anchor, edge)
  }

  const onRelease = () => {
    if (!dragging) return
    dragging = false

    if (Math.abs(edge - anchor) < MIN_DRAG) {
      clear()
      report(null)
      return
    }
    live = true
    const from = Math.min(anchor, edge)
    const to = Math.max(anchor, edge)
    report([scale.toValue(from), scale.toValue(to)])
  }

  /*
   * a drag anchors one edge and carries the other, and the keys do the same thing one
   * step at a time. the first press has nothing to anchor, so it takes the edge of the
   * frame it moves away from.
   */
  const moveEdge = (to: number) => {
    edge = clampX(to)
    live = true
    paint(anchor, edge)
    report([scale.toValue(Math.min(anchor, edge)), scale.toValue(Math.max(anchor, edge))])
  }

  const onKey = (event: KeyboardEvent) => {
    if (!KEYS.has(event.key)) return
    event.preventDefault()

    if (event.key === 'Escape') {
      if (!live) return
      clear()
      report(null)
      return
    }

    const back = event.key === 'ArrowLeft' || event.key === 'Home'
    if (!live) {
      anchor = back ? frame.right : frame.left
      edge = anchor
    }

    if (event.key === 'Home') moveEdge(frame.left)
    else if (event.key === 'End') moveEdge(frame.right)
    else moveEdge(edge + (back ? -step : step))
  }

  field.addEventListener('pointerdown', onDown)
  field.addEventListener('pointermove', onMove)
  field.addEventListener('lostpointercapture', onRelease)
  field.addEventListener('keydown', onKey)

  return {
    /*
     * the caller owns the range, so a re-render paints the window it still holds
     * rather than dropping it and leaving the two out of step.
     */
    show(range: readonly [T, T] | null) {
      if (!range) {
        clear()
        return
      }
      const from = clampX(scale.toPixel(range[0]))
      const to = clampX(scale.toPixel(range[1]))

      /* the moving edge stays the one the reader is moving, or the next key press reverses */
      const forward = edge >= anchor
      anchor = forward ? from : to
      edge = forward ? to : from
      live = true
      paint(from, to)
    },
    destroy() {
      field.removeEventListener('pointerdown', onDown)
      field.removeEventListener('pointermove', onMove)
      field.removeEventListener('lostpointercapture', onRelease)
      field.removeEventListener('keydown', onKey)
      selection.remove()
      field.remove()
    },
  }
}
