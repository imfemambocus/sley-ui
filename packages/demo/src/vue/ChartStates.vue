<script setup lang="ts">
import * as Plot from '@observablehq/plot'
import { computed, ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Chart, { type ChartOptions } from '@/components/ui/chart/Chart.vue'
import { crosshairX } from '@/components/ui/chart/crosshair'
import { dayLabel, quality, SPAN } from '../quality'

const STATES = ['loading', 'empty', 'data'] as const
type State = (typeof STATES)[number]

const state = ref<State>('loading')

const options = computed<ChartOptions>(() => ({
  x: { type: 'utc', label: null, domain: SPAN },
  y: { label: null, domain: [70, 100], grid: true },
  marks: [
    Plot.lineY(quality, { x: 'day', y: 'q30', stroke: 'assay', strokeWidth: 1.5 }),
    crosshairX(quality, { x: 'day', y: 'q30', formatX: (reading) => dayLabel(reading.day) }),
  ],
}))
</script>

<template>
  <Chart
    title="Q30 by assay"
    unit="%"
    :options="options"
    :height="220"
    :loading="state === 'loading'"
    :empty="state === 'empty'"
    empty-message="No reading in this range."
  >
    <template #actions>
      <Button v-for="name in STATES" :key="name" :aria-pressed="state === name" @click="state = name">
        <span :class="state === name ? undefined : 'text-weft-faint'">{{ name }}</span>
      </Button>
    </template>
  </Chart>
</template>
