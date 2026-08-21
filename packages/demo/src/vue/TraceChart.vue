<script setup lang="ts">
import * as Plot from '@observablehq/plot'
import { computed, ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Chart, { type ChartOptions } from '@/components/ui/chart/Chart.vue'
import { crosshairX } from '@/components/ui/chart/crosshair'
import { downsample } from '@/components/ui/chart/downsample'
import { clockLabel, READINGS, trace } from '../trace'

/* a thousand points across a frame of about a thousand pixels, so one point a column */
const TARGET = 1000

const count = (value: number) => value.toLocaleString('en-GB')

const full = ref(false)

const points = computed(() =>
  full.value ? trace() : downsample(trace(), (sample) => sample.at.getTime(), (sample) => sample.celsius, TARGET),
)

const options = computed<ChartOptions>(() => ({
  x: { type: 'utc', label: null },
  y: { label: null, domain: [20, 35], grid: true },
  marks: [
    Plot.lineY(points.value, { x: 'at', y: 'celsius', stroke: 'var(--color-pick-1)', strokeWidth: 1.5 }),
    crosshairX(points.value, { x: 'at', y: 'celsius', formatX: (sample) => clockLabel(sample.at) }),
  ],
}))
</script>

<template>
  <Chart title="Flow cell temperature" unit="°C" :options="options">
    <template #actions>
      <Button @click="full = !full">
        <span class="inline-flex items-baseline gap-1.5">
          <span class="font-data">{{ count(points.length) }}</span>
          <span class="text-weft-faint">{{ full ? 'every reading' : `of ${count(READINGS)}` }}</span>
        </span>
      </Button>
    </template>
  </Chart>
</template>
