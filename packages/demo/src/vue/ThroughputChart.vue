<script setup lang="ts">
import * as Plot from '@observablehq/plot'
import { computed } from 'vue'
import Chart, { type ChartOptions } from '@/components/ui/chart/Chart.vue'
import { SPAN } from '../quality'
import { throughput } from '../throughput'

/* an assay keeps the pick the quality chart gives it, so the two read as one screen */
const SERIES = ['WGS', 'Exome', 'Methyl']
const PICKS = ['var(--color-pick-1)', 'var(--color-pick-2)', 'var(--color-pick-3)']

const options = computed<ChartOptions>(() => ({
  x: { type: 'utc', label: null, domain: SPAN },
  y: { label: null, grid: true },
  color: { domain: SERIES, range: PICKS },
  marks: [Plot.areaY(throughput, { x: 'day', y: 'gb', fill: 'assay' })],
}))
</script>

<template>
  <Chart title="Daily output" unit="Gb" :options="options" :height="220">
    <template #actions>
      <ul class="flex items-baseline gap-(--stack)">
        <li v-for="(assay, index) in SERIES" :key="assay" class="flex items-baseline gap-1.5">
          <span
            class="size-1.25 shrink-0 translate-y-[-2px] rounded-full"
            :style="{ backgroundColor: PICKS[index] }"
          />
          <span class="text-weft-dim">{{ assay }}</span>
        </li>
      </ul>
    </template>
  </Chart>
</template>
