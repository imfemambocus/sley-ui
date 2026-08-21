<script lang="ts">
export type DayRange = readonly [Date, Date]
</script>

<script setup lang="ts">
import * as Plot from '@observablehq/plot'
import { computed, ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Chart, { type ChartOptions } from '@/components/ui/chart/Chart.vue'
import { crosshairX } from '@/components/ui/chart/crosshair'
import { dayLabel, quality, Q30_THRESHOLD, snapToDays, SPAN } from '../quality'

const props = defineProps<{ range: DayRange | null }>()

const emit = defineEmits<{ 'update:range': [range: DayRange | null] }>()

const SERIES = ['WGS', 'Exome', 'Methyl']
const PICKS = ['var(--color-pick-1)', 'var(--color-pick-2)', 'var(--color-pick-3)']

const hidden = ref<readonly string[]>([])

const shown = computed(() => quality.filter((reading) => !hidden.value.includes(reading.assay)))

const options = computed<ChartOptions>(() => ({
  /* the domain comes from the whole fixture, not from what is drawn, or hiding a line moves the axis */
  x: { type: 'utc', label: null, domain: SPAN },
  y: { label: null, domain: [70, 100], grid: true },
  color: { domain: SERIES, range: PICKS },
  marks: [
    Plot.ruleY([Q30_THRESHOLD], { stroke: 'var(--color-madder)', strokeDasharray: '3 3' }),
    Plot.text([Q30_THRESHOLD], {
      y: (value: number) => value,
      frameAnchor: 'right',
      text: () => `floor ${Q30_THRESHOLD}`,
      fill: 'var(--color-madder)',
      textAnchor: 'end',
      dy: -7,
      dx: -2,
    }),
    /* daily readings, so the line joins them straight. a curve would draw a value nobody measured. */
    Plot.lineY(shown.value, { x: 'day', y: 'q30', stroke: 'assay', strokeWidth: 1.5 }),
    crosshairX(shown.value, { x: 'day', y: 'q30', formatX: (reading) => dayLabel(reading.day) }),
  ],
}))

const toggle = (assay: string) => {
  hidden.value = hidden.value.includes(assay)
    ? hidden.value.filter((name) => name !== assay)
    : [...hidden.value, assay]
}

/* the caller widens the window to whole days, because a reading is a whole day */
const report = (next: DayRange | null) => emit('update:range', next && snapToDays(next))
</script>

<template>
  <Chart
    title="Q30 by assay"
    unit="%"
    :options="options"
    :brush="props.range"
    @update:brush="report"
  >
    <template #actions>
      <Button v-if="props.range" @click="emit('update:range', null)">
        <!-- two faces on one line, so they share a baseline instead of a box centre -->
        <span class="inline-flex items-baseline gap-1.5">
          <span class="font-data">{{ dayLabel(props.range[0]) }} to {{ dayLabel(props.range[1]) }}</span>
          <span class="text-weft-faint">clear</span>
        </span>
      </Button>

      <ul class="flex items-baseline gap-(--stack)">
        <li v-for="(assay, index) in SERIES" :key="assay" class="flex">
          <button
            type="button"
            :aria-pressed="!hidden.includes(assay)"
            class="flex cursor-pointer items-baseline gap-1.5"
            @click="toggle(assay)"
          >
            <span
              class="size-1.25 shrink-0 translate-y-[-2px] rounded-full transition-colors duration-(--dur-instant) ease-(--ease-beat)"
              :style="{ backgroundColor: hidden.includes(assay) ? 'var(--color-reed-lit)' : PICKS[index] }"
            />
            <span :class="hidden.includes(assay) ? 'text-weft-faint' : 'text-weft-dim'">{{ assay }}</span>
          </button>
        </li>
      </ul>
    </template>
  </Chart>
</template>
