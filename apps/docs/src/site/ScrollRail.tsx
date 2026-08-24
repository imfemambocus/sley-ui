import { useEffect, useRef, type RefObject } from 'react'
import { cx } from '@/lib/cx'

/* a page of any length still leaves something to grab */
const MIN_MARK = 32
const IDLE = 900

interface ScrollRailProps {
  /* the container that scrolls, or the page when it is left out */
  readonly scroller?: RefObject<HTMLElement | null>
}

export const ScrollRail = ({ scroller }: ScrollRailProps) => {
  const railRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rail = railRef.current
    const mark = markRef.current
    if (!rail || !mark) return undefined

    const box = scroller?.current ?? document.documentElement
    const source: EventTarget = scroller ? box : window
    let frame = 0
    let idle = 0
    let dragging = false
    let hovered = false
    let fromY = 0
    let fromTop = 0

    const geometry = () => {
      const track = rail.clientHeight
      const ratio = box.clientHeight / box.scrollHeight
      const height = Math.min(track, Math.max(track * ratio, MIN_MARK))
      return { height, travel: track - height, scrolled: box.scrollHeight - box.clientHeight }
    }

    const draw = () => {
      frame = 0
      const { height, travel, scrolled } = geometry()
      mark.style.height = `${height}px`
      mark.style.translate = `0 ${scrolled > 0 ? (box.scrollTop / scrolled) * travel : 0}px`
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(draw)
    }

    const hide = () => {
      if (dragging || hovered) return
      delete rail.dataset.active
    }

    const show = () => {
      rail.dataset.active = ''
      window.clearTimeout(idle)
      idle = window.setTimeout(hide, IDLE)
    }

    const onScroll = () => {
      schedule()
      show()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (geometry().travel <= 0) return
      event.preventDefault()
      dragging = true
      fromY = event.clientY
      fromTop = box.scrollTop
      rail.dataset.dragging = ''
      mark.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const { travel, scrolled } = geometry()
      if (travel <= 0) return
      /* the reading column scrolls smoothly for an anchor, which would animate every drag step */
      box.scrollTo({ top: fromTop + ((event.clientY - fromY) / travel) * scrolled, behavior: 'instant' })
    }

    const onDragEnd = () => {
      dragging = false
      delete rail.dataset.dragging
      show()
    }

    const onEnter = () => {
      hovered = true
      show()
    }

    const onLeave = () => {
      hovered = false
      show()
    }

    source.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule)
    mark.addEventListener('pointerdown', onPointerDown)
    mark.addEventListener('pointermove', onPointerMove)
    mark.addEventListener('lostpointercapture', onDragEnd)
    mark.addEventListener('pointerenter', onEnter)
    mark.addEventListener('pointerleave', onLeave)

    /* a route change replaces the whole content, so the height is watched rather than read once */
    const observer = new ResizeObserver(schedule)
    observer.observe(scroller ? box : document.body)
    if (scroller && box.firstElementChild) observer.observe(box.firstElementChild)

    return () => {
      source.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
      mark.removeEventListener('pointerdown', onPointerDown)
      mark.removeEventListener('pointermove', onPointerMove)
      mark.removeEventListener('lostpointercapture', onDragEnd)
      mark.removeEventListener('pointerenter', onEnter)
      mark.removeEventListener('pointerleave', onLeave)
      observer.disconnect()
      window.clearTimeout(idle)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [scroller])

  return (
    <div ref={railRef} aria-hidden="true" className={cx('scroll-rail', scroller && 'scroll-rail-inset')}>
      <div ref={markRef} className="scroll-mark" />
    </div>
  )
}
