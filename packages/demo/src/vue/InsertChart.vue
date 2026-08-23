<script lang="ts">
export type BaseRange = readonly [number, number]
</script>

<script setup lang="ts">
import * as Plot from '@observablehq/plot'
import { computed } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Chart, { type ChartOptions } from '@/components/ui/chart/Chart.vue'
import { DIMER, inserts, SPAN } from '../inserts'

const props = defineProps<{ range: BaseRange | null }>()

const emit = defineEmits<{ 'update:range': [range: BaseRange | null] }>()

/* the bin width, stated rather than derived, so the bars mean the same thing at every width */
const BIN = 10

const options = computed<ChartOptions>(() => ({
  x: { label: null, domain: SPAN },
  y: { label: null, grid: true },
  marks: [
    Plot.rectY(
      inserts(),
      Plot.binX<Plot.RectYOptions>({ y: 'count' }, { x: Plot.identity, interval: BIN, fill: 'var(--color-pick-1)' }),
    ),
    Plot.ruleX([DIMER.centre], { stroke: 'var(--color-madder)', strokeDasharray: '3 3' }),
    Plot.text([DIMER.centre], {
      x: (value: number) => value,
      frameAnchor: 'top',
      text: () => `dimer ${DIMER.centre}`,
      fill: 'var(--color-madder)',
      textAnchor: 'end',
      dx: -10,
      dy: 2,
    }),
  ],
}))

/* a fragment is a whole number of bases, and a window landing inside one covers it */
const report = (next: BaseRange | null) =>
  emit('update:range', next && [Math.floor(next[0]), Math.ceil(next[1])])
</script>

<template>
  <Chart
    title="Fragment length"
    unit="bp"
    :options="options"
    :height="220"
    :brush="props.range"
    @update:brush="report"
  >
    <template #actions>
      <Button v-if="props.range" @click="emit('update:range', null)">
        <!-- two faces on one line, so they share a baseline instead of a box centre -->
        <span class="inline-flex items-baseline gap-1.5">
          <span class="font-data">{{ props.range[0] }} to {{ props.range[1] }}</span>
          <span class="text-weft-faint">clear</span>
        </span>
      </Button>
    </template>
  </Chart>
</template>
