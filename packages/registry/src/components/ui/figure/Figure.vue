<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = withDefaults(
  defineProps<{
    value: number
    digits?: number
    low?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { digits: 1, low: false },
)

/* anything that is not a digit reads one step back */
const parts = computed(() => {
  const [whole, fraction] = props.value.toFixed(props.digits).split('.')
  return { whole, fraction }
})
</script>

<template>
  <span v-if="props.value === 0" :class="cx('reed-mark', props.class)" aria-hidden="true" />
  <span v-else :class="cx(props.low && 'reed-under', props.class)"
    >{{ parts.whole }}<span v-if="parts.fraction !== undefined" class="text-weft-faint">.{{ parts.fraction }}</span
    ><span v-if="props.low" class="sr-only"> below threshold</span></span
  >
</template>
