const SVG_NS = 'http://www.w3.org/2000/svg'

/* a click that travels less than this is a click, and a click clears the window */
const MIN_DRAG = 3

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

export function attachBrush<T>(
  svg: SVGSVGElement,
  frame: BrushFrame,
  scale: BrushScale<T>,
  report: (range: readonly [T, T] | null) => void,
) {
  const height = frame.bottom - frame.top

  const field = document.createElementNS(SVG_NS, 'rect')
  field.setAttribute('class', 'reed-brush-field')
  field.setAttribute('x', String(frame.left))
  field.setAttribute('y', String(frame.top))
  field.setAttribute('width', String(frame.right - frame.left))
  field.setAttribute('height', String(height))

  const selection = document.createElementNS(SVG_NS, 'rect')
  selection.setAttribute('class', 'reed-brush')
  selection.setAttribute('aria-hidden', 'true')
  selection.setAttribute('y', String(frame.top))
  selection.setAttribute('height', String(height))
  selection.setAttribute('width', '0')

  field.setAttribute('aria-hidden', 'true')

  /* the window tints the data rather than hiding it, so it goes under every mark */
  svg.insertBefore(selection, svg.firstChild)
  svg.append(field)

  let anchor = 0
  let edge = 0
  let dragging = false

  const xOf = (event: PointerEvent) => clampX(event.clientX - svg.getBoundingClientRect().left)

  const clampX = (value: number) => Math.max(frame.left, Math.min(frame.right, value))

  const paint = (from: number, to: number) => {
    selection.setAttribute('x', String(Math.min(from, to)))
    selection.setAttribute('width', String(Math.abs(to - from)))
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
      paint(0, 0)
      report(null)
      return
    }
    const from = Math.min(anchor, edge)
    const to = Math.max(anchor, edge)
    report([scale.toValue(from), scale.toValue(to)])
  }

  field.addEventListener('pointerdown', onDown)
  field.addEventListener('pointermove', onMove)
  field.addEventListener('lostpointercapture', onRelease)

  return {
    /*
     * the caller owns the range, so a re-render paints the window it still holds
     * rather than dropping it and leaving the two out of step.
     */
    show(range: readonly [T, T] | null) {
      if (!range) {
        paint(0, 0)
        return
      }
      paint(clampX(scale.toPixel(range[0])), clampX(scale.toPixel(range[1])))
    },
    destroy() {
      field.removeEventListener('pointerdown', onDown)
      field.removeEventListener('pointermove', onMove)
      field.removeEventListener('lostpointercapture', onRelease)
      selection.remove()
      field.remove()
    },
  }
}
