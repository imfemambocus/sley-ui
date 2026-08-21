<script lang="ts">
export type ChartOptions = Omit<Plot.PlotOptions, 'width' | 'height' | 'className'>
</script>

<script setup lang="ts" generic="X = Date">
import * as Plot from '@observablehq/plot'
import { computed, ref, watch, watchEffect, type HTMLAttributes } from 'vue'
import { attachBrush } from '@/components/ui/chart/brush'
import { drawBars, drawLines } from '@/components/ui/chart/motion'
import EmptyState from '@/components/ui/empty-state/EmptyState.vue'
import { cx } from '@/lib/cx'

const props = withDefaults(
  defineProps<{
    title: string
    /* the unit belongs in the header, the way a column head carries it and a cell never does */
    unit?: string
    /* hold this stable, or every parent render tears the plot down and builds it again */
    options: ChartOptions
    height?: number
    loading?: boolean
    /* a chart cannot read the caller's marks, so an empty result is stated and never derived */
    empty?: boolean
    emptyMessage?: string
    /* the window the chart paints. hold it in your own state, the way a table's selection works. */
    brush?: readonly [X, X] | null
    class?: HTMLAttributes['class']
  }>(),
  { height: 260, loading: false, empty: false, emptyMessage: 'No data in this range.', brush: null },
)

/*
 * a drag reports a range of the x scale, and an arrow key on the plot moves one edge of
 * one by a tick of that axis. a single click reports null, and so does escape.
 */
const emit = defineEmits<{ 'update:brush': [range: readonly [X, X] | null] }>()

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

/* the frame is measured rather than the host, because the host leaves while a state shows */
const frame = ref<HTMLDivElement | null>(null)
const host = ref<HTMLDivElement | null>(null)
const width = ref(0)

/* plain holders rather than refs: the effect below would rebuild the plot on every brush move */
let windowHandle: { show: (range: readonly [X, X] | null) => void } | null = null
let brushed = props.brush

/* the lines draw in once. a resize rebuilds the plot, and replaying it there reads as a glitch. */
let drawn = false

/* a rebuild takes the focused field down with it, so a resize would strand the keyboard */
let held = false

/* loading wins: a chart still waiting on a fetch has nothing to call empty yet */
const showEmpty = computed(() => props.empty && !props.loading)
const plotting = computed(() => !props.loading && !showEmpty.value)

watch(
  () => props.brush,
  (range) => {
    brushed = range
    windowHandle?.show(range)
  },
)

watchEffect((onCleanup) => {
  const node = frame.value
  if (!node) return

  const observer = new ResizeObserver(([entry]) => {
    width.value = Math.floor(entry.contentRect.width)
  })
  observer.observe(node)
  onCleanup(() => observer.disconnect())
})

watchEffect(
  (onCleanup) => {
    const node = host.value
    if (!node || width.value === 0) return

    const margins = { ...MARGIN, ...props.options }
    const plot = Plot.plot({
      ...margins,
      ariaLabel: props.title,
      x: { ...AXIS, ...props.options.x },
      y: { ...AXIS, ...props.options.y },
      width: width.value,
      height: props.height,
      className: PLOT_CLASS,
    })
    node.append(plot)

    const svg = plot instanceof SVGSVGElement ? plot : plot.querySelector('svg')
    if (svg && !drawn) {
      drawn = true
      drawLines(svg)
      drawBars(svg)
    }

    const scale = plot.scale('x')
    if (!svg || !scale?.invert) {
      onCleanup(() => plot.remove())
      return
    }

    /* plot types every scale value as any, so both readings are named here once */
    const toValue: (px: number) => X = scale.invert.bind(scale)
    const toPixel: (value: X) => number = scale.apply.bind(scale)

    const handle = attachBrush(
      svg,
      {
        left: margins.marginLeft,
        right: width.value - margins.marginRight,
        top: margins.marginTop,
        bottom: props.height - margins.marginBottom,
      },
      { toValue, toPixel },
      (range) => emit('update:brush', range),
    )
    handle.show(brushed)
    if (held) handle.restore()
    windowHandle = handle

    onCleanup(() => {
      held = handle.focused()
      windowHandle = null
      handle.destroy()
      plot.remove()
    })
  },
  { flush: 'post' },
)
</script>

<template>
  <section :class="cx('@container border border-reed bg-raised', props.class)">
    <header class="flex items-center justify-between gap-(--stack) border-b border-reed px-(--cell-x) py-(--stack)">
      <h2 class="inline-flex items-baseline gap-1.5 font-medium">
        <span>{{ props.title }}</span>
        <span v-if="props.unit" class="font-data font-normal text-weft-faint">{{ props.unit }}</span>
      </h2>
      <div v-if="$slots.actions" class="flex items-center gap-(--stack)">
        <slot name="actions" />
      </div>
    </header>

    <div ref="frame" :aria-busy="props.loading" class="px-(--cell-x) py-(--stack)">
      <div v-if="plotting" ref="host" />
      <div v-if="props.loading" class="reed-warp reed-warp-beat" :style="{ height: `${props.height}px` }" />
      <div v-if="showEmpty" :style="{ height: `${props.height}px` }">
        <EmptyState :title="props.emptyMessage" class="h-full" />
      </div>
    </div>
  </section>
</template>
